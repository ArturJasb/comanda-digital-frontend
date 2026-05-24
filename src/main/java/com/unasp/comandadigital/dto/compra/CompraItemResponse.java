package com.unasp.comandadigital.dto.compra;

import com.unasp.comandadigital.entity.PedidoCompraItem;

import java.math.BigDecimal;

public record CompraItemResponse(
        Long id,
        Long ingredienteId,
        String ingredienteNome,
        BigDecimal quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal
) {
    public static CompraItemResponse from(PedidoCompraItem item) {
        return new CompraItemResponse(
                item.getId(),
                item.getIngrediente().getId(),
                item.getIngrediente().getNome(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getSubtotal()
        );
    }
}
