package com.unasp.comandadigital.dto.prato;

import java.math.BigDecimal;

public record CustoResponse(
        Long pratoId,
        String pratoNome,
        BigDecimal precoVenda,
        BigDecimal custoTotal,
        BigDecimal foodCostPct,
        /** VERDE, AMARELO ou VERMELHO. */
        String classificacao
) {}
