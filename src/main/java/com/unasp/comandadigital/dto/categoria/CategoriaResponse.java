package com.unasp.comandadigital.dto.categoria;

import com.unasp.comandadigital.entity.Categoria;
import com.unasp.comandadigital.entity.enums.StatusGeral;

public record CategoriaResponse(
        Long id,
        String nome,
        String descricao,
        Integer ordem,
        StatusGeral status
) {
    public static CategoriaResponse from(Categoria c) {
        return new CategoriaResponse(
                c.getId(),
                c.getNome(),
                c.getDescricao(),
                c.getOrdem(),
                c.getStatus()
        );
    }
}
