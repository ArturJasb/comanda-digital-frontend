package com.unasp.comandadigital.dto.prato;

import com.unasp.comandadigital.dto.categoria.CategoriaResponse;
import com.unasp.comandadigital.entity.Prato;
import com.unasp.comandadigital.entity.enums.StatusPrato;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PratoResponse(
        Long id,
        String nome,
        String descricao,
        String fotoUrl,
        BigDecimal precoVenda,
        Integer tempoPreparoMin,
        StatusPrato status,
        CategoriaResponse categoria,
        LocalDateTime createdAt
) {
    public static PratoResponse from(Prato p) {
        return new PratoResponse(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getFotoUrl(),
                p.getPrecoVenda(),
                p.getTempoPreparoMin(),
                p.getStatus(),
                CategoriaResponse.from(p.getCategoria()),
                p.getCreatedAt()
        );
    }
}
