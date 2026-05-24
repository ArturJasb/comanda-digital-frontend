package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.estoque.MovimentacaoRequest;
import com.unasp.comandadigital.dto.estoque.MovimentacaoResponse;
import com.unasp.comandadigital.entity.EstoqueMovimentacao;
import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.Pedido;
import com.unasp.comandadigital.entity.PedidoCompra;
import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.MotivoMovimentacao;
import com.unasp.comandadigital.entity.enums.TipoMovimentacao;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.EstoqueInsuficienteException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.EstoqueMovimentacaoRepository;
import com.unasp.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final EstoqueMovimentacaoRepository movimentacaoRepository;
    private final IngredienteService ingredienteService;
    private final UsuarioRepository usuarioRepository;

    /** Motivos permitidos para saida manual (RF-30). */
    private static final Set<MotivoMovimentacao> MOTIVOS_SAIDA_MANUAL = Set.of(
            MotivoMovimentacao.DESPERDICIO,
            MotivoMovimentacao.VENCIMENTO,
            MotivoMovimentacao.QUEBRA,
            MotivoMovimentacao.USO_INTERNO,
            MotivoMovimentacao.AJUSTE
    );

    /** Conveniencia: o controller passa o email do principal. */
    @Transactional
    public MovimentacaoResponse registrarSaidaManualPorEmail(MovimentacaoRequest request, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + email));
        return registrarSaidaManual(request, usuario);
    }

    @Transactional(readOnly = true)
    public Page<MovimentacaoResponse> listarPorIngrediente(Long ingredienteId, Pageable pageable) {
        return movimentacaoRepository
                .findByIngredienteIdOrderByCreatedAtDesc(ingredienteId, pageable)
                .map(MovimentacaoResponse::from);
    }

    /** RF-30: saida manual (perda). */
    @Transactional
    public MovimentacaoResponse registrarSaidaManual(MovimentacaoRequest request, Usuario usuario) {
        MotivoMovimentacao motivo = request.motivo();
        if (!MOTIVOS_SAIDA_MANUAL.contains(motivo)) {
            throw new BusinessException(
                    "Motivo invalido para saida manual. Use: DESPERDICIO, VENCIMENTO, QUEBRA, USO_INTERNO ou AJUSTE");
        }

        Ingrediente ingrediente = ingredienteService.buscar(request.ingredienteId());
        BigDecimal saldo = ingredienteService.getSaldo(ingrediente.getId());

        if (saldo.compareTo(request.quantidade()) < 0) {
            throw new EstoqueInsuficienteException(
                    ingrediente.getNome(), saldo, request.quantidade());
        }

        EstoqueMovimentacao mov = EstoqueMovimentacao.builder()
                .ingrediente(ingrediente)
                .tipo(TipoMovimentacao.SAIDA)
                .quantidade(request.quantidade())
                .motivo(motivo)
                .lote(request.lote())
                .validade(request.validade())
                .custoUnitario(ingrediente.getCustoUnitario())
                .usuario(usuario)
                .build();

        return MovimentacaoResponse.from(movimentacaoRepository.save(mov));
    }

    /** RF-29: baixa automatica ao confirmar pedido (chamado por PedidoService). */
    @Transactional
    public void registrarBaixaPorPedido(Ingrediente ingrediente, BigDecimal quantidade,
                                        Pedido pedido, Usuario usuario) {
        BigDecimal saldo = ingredienteService.getSaldo(ingrediente.getId());

        if (saldo.compareTo(quantidade) < 0) {
            throw new EstoqueInsuficienteException(
                    ingrediente.getNome(), saldo, quantidade);
        }

        EstoqueMovimentacao mov = EstoqueMovimentacao.builder()
                .ingrediente(ingrediente)
                .tipo(TipoMovimentacao.SAIDA)
                .quantidade(quantidade)
                .motivo(MotivoMovimentacao.VENDA)
                .pedido(pedido)
                .usuario(usuario)
                .custoUnitario(ingrediente.getCustoUnitario())
                .build();

        movimentacaoRepository.save(mov);
    }

    /** RF-18 / RN04: estorno ao cancelar pedido confirmado. */
    @Transactional
    public void registrarEstornoPorPedido(Ingrediente ingrediente, BigDecimal quantidade,
                                          Pedido pedido, Usuario usuario) {
        EstoqueMovimentacao mov = EstoqueMovimentacao.builder()
                .ingrediente(ingrediente)
                .tipo(TipoMovimentacao.ESTORNO)
                .quantidade(quantidade)
                .motivo(MotivoMovimentacao.ESTORNO)
                .pedido(pedido)
                .usuario(usuario)
                .custoUnitario(ingrediente.getCustoUnitario())
                .build();

        movimentacaoRepository.save(mov);
    }

    /** RF-25: entrada de estoque ao receber compra. */
    @Transactional
    public void registrarEntradaPorCompra(Ingrediente ingrediente, BigDecimal quantidade,
                                          BigDecimal custoUnitario, PedidoCompra compra,
                                          String lote, Usuario usuario) {
        EstoqueMovimentacao mov = EstoqueMovimentacao.builder()
                .ingrediente(ingrediente)
                .tipo(TipoMovimentacao.ENTRADA)
                .quantidade(quantidade)
                .motivo(MotivoMovimentacao.COMPRA)
                .pedidoCompra(compra)
                .custoUnitario(custoUnitario)
                .lote(lote)
                .usuario(usuario)
                .build();

        movimentacaoRepository.save(mov);
    }
}
