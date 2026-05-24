package com.unasp.comandadigital.dto.estoque;

import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.entity.enums.UnidadeMedida;

import java.math.BigDecimal;

public record IngredienteResponse(
        Long id,
        String nome,
        String sku,
        UnidadeMedida unidadePadrao,
        BigDecimal estoqueMinimo,
        BigDecimal custoUnitario,
        BigDecimal saldoAtual,
        boolean alertaMinimo,
        StatusGeral status
) {
    public static IngredienteResponse from(Ingrediente i, BigDecimal saldo) {
        BigDecimal saldoSafe = saldo != null ? saldo : BigDecimal.ZERO;
        boolean alerta = saldoSafe.compareTo(i.getEstoqueMinimo()) < 0;
        return new IngredienteResponse(
                i.getId(),
                i.getNome(),
                i.getSku(),
                i.getUnidadePadrao(),
                i.getEstoqueMinimo(),
                i.getCustoUnitario(),
                saldoSafe,
                alerta,
                i.getStatus()
        );
    }
}
