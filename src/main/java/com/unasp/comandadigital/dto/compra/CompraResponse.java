package com.unasp.comandadigital.dto.compra;

import com.unasp.comandadigital.entity.PedidoCompra;
import com.unasp.comandadigital.entity.enums.StatusCompra;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CompraResponse(
        Long id,
        Long fornecedorId,
        String fornecedorNome,
        StatusCompra status,
        BigDecimal valorTotal,
        String usuarioNome,
        List<CompraItemResponse> itens,
        LocalDateTime createdAt
) {
    public static CompraResponse from(PedidoCompra pc) {
        List<CompraItemResponse> itens = pc.getItens() == null
                ? List.of()
                : pc.getItens().stream().map(CompraItemResponse::from).toList();

        return new CompraResponse(
                pc.getId(),
                pc.getFornecedor().getId(),
                pc.getFornecedor().getRazaoSocial(),
                pc.getStatus(),
                pc.getValorTotal(),
                pc.getUsuario().getNome(),
                itens,
                pc.getCreatedAt()
        );
    }
}
