package com.unasp.comandadigital.dto.prato;

import java.math.BigDecimal;
import java.util.List;

public record FichaTecnicaResponse(
        Long id,
        Long pratoId,
        String pratoNome,
        int rendimento,
        String modoPreparo,
        List<FichaTecnicaItemResponse> itens,
        BigDecimal custoTotal,
        BigDecimal foodCostPct,
        /** VERDE, AMARELO ou VERMELHO (RF-13). */
        String classificacao,
        /** Mensagem de aviso quando food cost > 35% (RN02). Null se ok. */
        String avisoFoodCost
) {}
