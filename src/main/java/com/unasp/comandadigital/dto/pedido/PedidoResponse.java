package com.unasp.comandadigital.dto.pedido;

import com.unasp.comandadigital.entity.Pedido;
import com.unasp.comandadigital.entity.enums.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        StatusPedido status,
        BigDecimal valorTotal,
        String enderecoEntrega,
        String observacoes,
        String motivoCancelamento,
        List<PedidoItemResponse> itens,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static PedidoResponse from(Pedido p) {
        List<PedidoItemResponse> itens = p.getItens() == null
                ? List.of()
                : p.getItens().stream().map(PedidoItemResponse::from).toList();

        return new PedidoResponse(
                p.getId(),
                p.getCliente().getId(),
                p.getCliente().getNome(),
                p.getStatus(),
                p.getValorTotal(),
                p.getEnderecoEntrega(),
                p.getObservacoes(),
                p.getMotivoCancelamento(),
                itens,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
