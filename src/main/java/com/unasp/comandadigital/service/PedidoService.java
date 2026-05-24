package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.pedido.CancelamentoRequest;
import com.unasp.comandadigital.dto.pedido.PedidoItemRequest;
import com.unasp.comandadigital.dto.pedido.PedidoRequest;
import com.unasp.comandadigital.dto.pedido.PedidoResponse;
import com.unasp.comandadigital.dto.pedido.StatusUpdateRequest;
import com.unasp.comandadigital.entity.FichaTecnica;
import com.unasp.comandadigital.entity.FichaTecnicaItem;
import com.unasp.comandadigital.entity.Pedido;
import com.unasp.comandadigital.entity.PedidoItem;
import com.unasp.comandadigital.entity.Prato;
import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.Perfil;
import com.unasp.comandadigital.entity.enums.StatusPedido;
import com.unasp.comandadigital.entity.enums.StatusPrato;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.EstoqueInsuficienteException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.FichaTecnicaRepository;
import com.unasp.comandadigital.repository.PedidoRepository;
import com.unasp.comandadigital.repository.PratoRepository;
import com.unasp.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PratoRepository pratoRepository;
    private final FichaTecnicaRepository fichaTecnicaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstoqueService estoqueService;
    private final IngredienteService ingredienteService;

    /** RF-06: cliente cria pedido (checkout). */
    @Transactional
    public PedidoResponse criar(PedidoRequest request, String emailCliente) {
        Usuario cliente = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailCliente));

        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .status(StatusPedido.RECEBIDO)
                .enderecoEntrega(request.enderecoEntrega() != null && !request.enderecoEntrega().isBlank()
                        ? request.enderecoEntrega()
                        : cliente.getEndereco())
                .observacoes(request.observacoes())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PedidoItemRequest itemReq : request.itens()) {
            Prato prato = pratoRepository.findById(itemReq.pratoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prato", itemReq.pratoId()));

            // RN09: apenas pratos ATIVOS podem ser pedidos
            if (prato.getStatus() != StatusPrato.ATIVO) {
                throw new BusinessException("Prato indisponivel: " + prato.getNome());
            }

            // RN03: estoque deve ser suficiente antes de criar o pedido
            validarEstoque(prato, itemReq.quantidade());

            PedidoItem item = PedidoItem.builder()
                    .prato(prato)
                    .quantidade(itemReq.quantidade())
                    .precoUnitario(prato.getPrecoVenda())
                    .observacoes(itemReq.observacoes())
                    .build();

            pedido.adicionarItem(item);
            total = total.add(prato.getPrecoVenda().multiply(BigDecimal.valueOf(itemReq.quantidade())));
        }

        pedido.setValorTotal(total);

        // Cascade ALL salva pedido + itens em uma unica chamada (sem double save)
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    public Page<PedidoResponse> listarMeusPedidos(String emailCliente, Pageable pageable) {
        Usuario cliente = usuarioRepository.findByEmail(emailCliente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailCliente));
        return pedidoRepository.findByClienteIdOrderByCreatedAtDesc(cliente.getId(), pageable)
                .map(PedidoResponse::from);
    }

    public PedidoResponse buscarStatus(Long pedidoId, String emailCliente) {
        Pedido pedido = buscar(pedidoId);
        if (!pedido.getCliente().getEmail().equals(emailCliente)) {
            throw new AccessDeniedException("Acesso negado a este pedido");
        }
        return PedidoResponse.from(pedido);
    }

    public Page<PedidoResponse> listarTodos(StatusPedido status, LocalDateTime dataInicio,
                                            LocalDateTime dataFim, Pageable pageable) {
        return pedidoRepository.findWithFilters(status, dataInicio, dataFim, pageable)
                .map(PedidoResponse::from);
    }

    public PedidoResponse buscarPorId(Long id) {
        return PedidoResponse.from(buscar(id));
    }

    /** RF-16 / RF-17: muda o status (baixa de estoque ao CONFIRMAR). */
    @Transactional
    public PedidoResponse alterarStatus(Long pedidoId, StatusUpdateRequest request, String emailUsuario) {
        Pedido pedido = buscar(pedidoId);
        StatusPedido novoStatus = request.status();
        StatusPedido statusAtual = pedido.getStatus();

        validarTransicaoStatus(statusAtual, novoStatus);

        // RF-17: ao CONFIRMAR (RECEBIDO -> CONFIRMADO), baixa estoque automaticamente
        if (novoStatus == StatusPedido.CONFIRMADO && statusAtual == StatusPedido.RECEBIDO) {
            Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailUsuario));
            darBaixaEstoque(pedido, usuario);
        }

        pedido.setStatus(novoStatus);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    /**
     * RF-18 / RN04: cancelar pedido com estorno se necessario.
     * Quem pode cancelar:
     *  - antes de EM_PREPARO: qualquer um (incluindo o CLIENTE dono)
     *  - de EM_PREPARO em diante: apenas ADMIN ou GERENTE
     */
    @Transactional
    public PedidoResponse cancelar(Long pedidoId, CancelamentoRequest request, String emailUsuario) {
        Pedido pedido = buscar(pedidoId);
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailUsuario));

        StatusPedido statusAtual = pedido.getStatus();

        if (statusAtual == StatusPedido.CANCELADO || statusAtual == StatusPedido.FINALIZADO) {
            throw new BusinessException("Pedido ja esta " + statusAtual);
        }

        // RN04: apos EM_PREPARO, so ADMIN/GERENTE
        boolean apos = statusAtual == StatusPedido.EM_PREPARO
                || statusAtual == StatusPedido.PRONTO
                || statusAtual == StatusPedido.SAIU_ENTREGA;

        if (apos && usuario.getPerfil() != Perfil.ADMIN && usuario.getPerfil() != Perfil.GERENTE) {
            throw new AccessDeniedException(
                    "Apos EM_PREPARO apenas ADMIN ou GERENTE pode cancelar o pedido");
        }

        // Se o CLIENTE estiver cancelando, so pode cancelar o proprio pedido
        if (usuario.getPerfil() == Perfil.CLIENTE
                && !pedido.getCliente().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("Cliente so pode cancelar os proprios pedidos");
        }

        // Se ja houve baixa no estoque (CONFIRMADO em diante), fazer estorno
        boolean estoqueBaixado = statusAtual == StatusPedido.CONFIRMADO
                || statusAtual == StatusPedido.EM_PREPARO
                || statusAtual == StatusPedido.PRONTO
                || statusAtual == StatusPedido.SAIU_ENTREGA;

        if (estoqueBaixado) {
            estornarEstoque(pedido, usuario);
        }

        pedido.setStatus(StatusPedido.CANCELADO);
        pedido.setMotivoCancelamento(request.motivo());

        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    // -------------------- privados --------------------

    private void darBaixaEstoque(Pedido pedido, Usuario usuario) {
        for (PedidoItem item : pedido.getItens()) {
            FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(item.getPrato().getId())
                    .orElseThrow(() -> new BusinessException(
                            "Prato sem ficha tecnica: " + item.getPrato().getNome()));

            for (FichaTecnicaItem fichaItem : ficha.getItens()) {
                BigDecimal qtdNecessaria = calcularQtdNecessaria(fichaItem, item.getQuantidade());
                estoqueService.registrarBaixaPorPedido(
                        fichaItem.getIngrediente(), qtdNecessaria, pedido, usuario);
            }
        }
    }

    private void estornarEstoque(Pedido pedido, Usuario usuario) {
        for (PedidoItem item : pedido.getItens()) {
            fichaTecnicaRepository.findByPratoId(item.getPrato().getId())
                    .ifPresent(ficha -> {
                        for (FichaTecnicaItem fichaItem : ficha.getItens()) {
                            BigDecimal qtd = calcularQtdNecessaria(fichaItem, item.getQuantidade());
                            estoqueService.registrarEstornoPorPedido(
                                    fichaItem.getIngrediente(), qtd, pedido, usuario);
                        }
                    });
        }
    }

    private BigDecimal calcularQtdNecessaria(FichaTecnicaItem fichaItem, int quantidadePedido) {
        return fichaItem.getQuantidade()
                .multiply(fichaItem.getFatorCorrecao())
                .multiply(BigDecimal.valueOf(quantidadePedido));
    }

    /** RN03: bloqueia criacao do pedido se estoque insuficiente. */
    private void validarEstoque(Prato prato, int quantidade) {
        FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(prato.getId()).orElse(null);
        if (ficha == null) {
            return; // RN01 ja exige ficha pra ATIVAR, mas guarda contra estado inconsistente
        }

        for (FichaTecnicaItem fichaItem : ficha.getItens()) {
            BigDecimal qtdNecessaria = calcularQtdNecessaria(fichaItem, quantidade);
            BigDecimal saldo = ingredienteService.getSaldo(fichaItem.getIngrediente().getId());

            if (saldo.compareTo(qtdNecessaria) < 0) {
                throw new EstoqueInsuficienteException(
                        fichaItem.getIngrediente().getNome(), saldo, qtdNecessaria);
            }
        }
    }

    private void validarTransicaoStatus(StatusPedido atual, StatusPedido novo) {
        boolean valido = switch (atual) {
            case RECEBIDO     -> novo == StatusPedido.CONFIRMADO   || novo == StatusPedido.CANCELADO;
            case CONFIRMADO   -> novo == StatusPedido.EM_PREPARO   || novo == StatusPedido.CANCELADO;
            case EM_PREPARO   -> novo == StatusPedido.PRONTO       || novo == StatusPedido.CANCELADO;
            case PRONTO       -> novo == StatusPedido.SAIU_ENTREGA || novo == StatusPedido.CANCELADO;
            case SAIU_ENTREGA -> novo == StatusPedido.FINALIZADO   || novo == StatusPedido.CANCELADO;
            default           -> false;
        };
        if (!valido) {
            throw new BusinessException("Transicao invalida de status: " + atual + " -> " + novo);
        }
    }

    private Pedido buscar(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
    }
}
