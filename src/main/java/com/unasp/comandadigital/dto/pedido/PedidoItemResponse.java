package com.unasp.comandadigital.dto.pedido;

import com.unasp.comandadigital.entity.PedidoItem;

import java.math.BigDecimal;

public record PedidoItemResponse(
        Long id,
        Long pratoId,
        String pratoNome,
        String pratoFotoUrl,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        String observacoes
) {
    public static PedidoItemResponse from(PedidoItem pi) {
        BigDecimal subtotal = pi.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(pi.getQuantidade()));
        return new PedidoItemResponse(
                pi.getId(),
                pi.getPrato().getId(),
                pi.getPrato().getNome(),
                pi.getPrato().getFotoUrl(),
                pi.getQuantidade(),
                pi.getPrecoUnitario(),
                subtotal,
                pi.getObservacoes()
        );
    }
}
