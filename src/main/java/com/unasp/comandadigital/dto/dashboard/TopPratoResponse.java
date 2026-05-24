package com.unasp.comandadigital.dto.dashboard;

public record TopPratoResponse(
        Long pratoId,
        String pratoNome,
        Long totalVendido
) {}
