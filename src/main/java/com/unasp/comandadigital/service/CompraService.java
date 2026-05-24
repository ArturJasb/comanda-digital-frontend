package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.compra.CompraItemRequest;
import com.unasp.comandadigital.dto.compra.CompraRequest;
import com.unasp.comandadigital.dto.compra.CompraResponse;
import com.unasp.comandadigital.entity.Fornecedor;
import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.PedidoCompra;
import com.unasp.comandadigital.entity.PedidoCompraItem;
import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.StatusCompra;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.IngredienteRepository;
import com.unasp.comandadigital.repository.PedidoCompraRepository;
import com.unasp.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompraService {

    private final PedidoCompraRepository compraRepository;
    private final FornecedorService fornecedorService;
    private final IngredienteService ingredienteService;
    private final IngredienteRepository ingredienteRepository;
    private final EstoqueService estoqueService;
    private final UsuarioRepository usuarioRepository;

    public Page<CompraResponse> listar(Pageable pageable) {
        return compraRepository.findAllByOrderByCreatedAtDesc(pageable).map(CompraResponse::from);
    }

    public CompraResponse buscarPorId(Long id) {
        return CompraResponse.from(buscar(id));
    }

    /** RF-24: cria pedido de compra em RASCUNHO. */
    @Transactional
    public CompraResponse criar(CompraRequest request, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailUsuario));
        Fornecedor fornecedor = fornecedorService.buscar(request.fornecedorId());

        PedidoCompra compra = PedidoCompra.builder()
                .fornecedor(fornecedor)
                .usuario(usuario)
                .status(StatusCompra.RASCUNHO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CompraItemRequest itemReq : request.itens()) {
            Ingrediente ingrediente = ingredienteService.buscar(itemReq.ingredienteId());
            BigDecimal subtotal = itemReq.quantidade().multiply(itemReq.precoUnitario());

            PedidoCompraItem item = PedidoCompraItem.builder()
                    .ingrediente(ingrediente)
                    .quantidade(itemReq.quantidade())
                    .precoUnitario(itemReq.precoUnitario())
                    .subtotal(subtotal)
                    .build();

            compra.adicionarItem(item);
            total = total.add(subtotal);
        }

        compra.setValorTotal(total);
        return CompraResponse.from(compraRepository.save(compra));
    }

    /**
     * Alteracao de status de compra.
     * RASCUNHO -> ENVIADO ou CANCELADO
     * ENVIADO  -> CANCELADO (RECEBIDO so via endpoint dedicado /receber)
     */
    @Transactional
    public CompraResponse alterarStatus(Long id, StatusCompra novoStatus, String emailUsuario) {
        PedidoCompra compra = buscar(id);

        // Bloqueia transicao direta para RECEBIDO -- usar /receber
        if (novoStatus == StatusCompra.RECEBIDO) {
            throw new BusinessException(
                    "Para registrar recebimento, use o endpoint POST /api/admin/compras/{id}/receber");
        }

        validarTransicao(compra.getStatus(), novoStatus);
        compra.setStatus(novoStatus);

        return CompraResponse.from(compraRepository.save(compra));
    }

    /**
     * RF-25 / RN05: recebimento de mercadoria.
     * Gera entrada de estoque para cada item E atualiza o custo unitario do ingrediente.
     */
    @Transactional
    public CompraResponse receberMercadoria(Long id, String emailUsuario) {
        PedidoCompra compra = buscar(id);
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + emailUsuario));

        if (compra.getStatus() != StatusCompra.ENVIADO) {
            throw new BusinessException(
                    "So e possivel receber compras com status ENVIADO. Status atual: " + compra.getStatus());
        }

        for (PedidoCompraItem item : compra.getItens()) {
            Ingrediente ingrediente = item.getIngrediente();

            // RN05: atualiza custo unitario do ingrediente pelo preco da compra
            ingrediente.setCustoUnitario(item.getPrecoUnitario());
            ingredienteRepository.save(ingrediente);

            // Registra entrada no estoque
            estoqueService.registrarEntradaPorCompra(
                    ingrediente,
                    item.getQuantidade(),
                    item.getPrecoUnitario(),
                    compra,
                    null,
                    usuario
            );
        }

        compra.setStatus(StatusCompra.RECEBIDO);
        return CompraResponse.from(compraRepository.save(compra));
    }

    @Transactional
    public CompraResponse atualizar(Long id, CompraRequest request, String emailUsuario) {
        PedidoCompra compra = buscar(id);

        if (compra.getStatus() != StatusCompra.RASCUNHO) {
            throw new BusinessException("Apenas compras em RASCUNHO podem ser editadas");
        }

        Fornecedor fornecedor = fornecedorService.buscar(request.fornecedorId());
        compra.setFornecedor(fornecedor);
        compra.getItens().clear();

        BigDecimal total = BigDecimal.ZERO;
        for (CompraItemRequest itemReq : request.itens()) {
            Ingrediente ingrediente = ingredienteService.buscar(itemReq.ingredienteId());
            BigDecimal subtotal = itemReq.quantidade().multiply(itemReq.precoUnitario());

            PedidoCompraItem item = PedidoCompraItem.builder()
                    .ingrediente(ingrediente)
                    .quantidade(itemReq.quantidade())
                    .precoUnitario(itemReq.precoUnitario())
                    .subtotal(subtotal)
                    .build();

            compra.adicionarItem(item);
            total = total.add(subtotal);
        }

        compra.setValorTotal(total);
        return CompraResponse.from(compraRepository.save(compra));
    }

    private void validarTransicao(StatusCompra atual, StatusCompra novo) {
        boolean valido = switch (atual) {
            case RASCUNHO -> novo == StatusCompra.ENVIADO  || novo == StatusCompra.CANCELADO;
            case ENVIADO  -> novo == StatusCompra.CANCELADO;
            default       -> false;
        };
        if (!valido) {
            throw new BusinessException("Transicao invalida: " + atual + " -> " + novo);
        }
    }

    private PedidoCompra buscar(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido de compra", id));
    }
}
