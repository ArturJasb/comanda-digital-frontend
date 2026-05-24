package com.unasp.comandadigital.dto.estoque;

import com.unasp.comandadigital.entity.EstoqueMovimentacao;
import com.unasp.comandadigital.entity.enums.MotivoMovimentacao;
import com.unasp.comandadigital.entity.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MovimentacaoResponse(
        Long id,
        Long ingredienteId,
        String ingredienteNome,
        TipoMovimentacao tipo,
        BigDecimal quantidade,
        MotivoMovimentacao motivo,
        String lote,
        LocalDate validade,
        BigDecimal custoUnitario,
        String usuarioNome,
        LocalDateTime createdAt
) {
    public static MovimentacaoResponse from(EstoqueMovimentacao m) {
        return new MovimentacaoResponse(
                m.getId(),
                m.getIngrediente().getId(),
                m.getIngrediente().getNome(),
                m.getTipo(),
                m.getQuantidade(),
                m.getMotivo(),
                m.getLote(),
                m.getValidade(),
                m.getCustoUnitario(),
                m.getUsuario().getNome(),
                m.getCreatedAt()
        );
    }
}
