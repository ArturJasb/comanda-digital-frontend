package com.unasp.comandadigital.dto.prato;

import com.unasp.comandadigital.entity.FichaTecnicaItem;
import com.unasp.comandadigital.entity.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record FichaTecnicaItemResponse(
        Long id,
        Long ingredienteId,
        String ingredienteNome,
        BigDecimal quantidade,
        UnidadeMedida unidade,
        BigDecimal fatorCorrecao,
        BigDecimal custoUnitario,
        BigDecimal custoItem
) {
    public static FichaTecnicaItemResponse from(FichaTecnicaItem item) {
        BigDecimal custo = item.getQuantidade()
                .multiply(item.getFatorCorrecao())
                .multiply(item.getIngrediente().getCustoUnitario())
                .setScale(4, RoundingMode.HALF_UP);

        return new FichaTecnicaItemResponse(
                item.getId(),
                item.getIngrediente().getId(),
                item.getIngrediente().getNome(),
                item.getQuantidade(),
                item.getUnidade(),
                item.getFatorCorrecao(),
                item.getIngrediente().getCustoUnitario(),
                custo
        );
    }
}
