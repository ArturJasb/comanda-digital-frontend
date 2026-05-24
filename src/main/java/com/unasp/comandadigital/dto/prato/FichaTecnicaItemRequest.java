package com.unasp.comandadigital.dto.prato;

import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FichaTecnicaItemRequest(
        @NotNull(message = "ID do ingrediente obrigatorio")
        Long ingredienteId,

        @NotNull(message = "Quantidade obrigatoria")
        @DecimalMin(value = "0.0001", message = "Quantidade deve ser maior que zero")
        BigDecimal quantidade,

        @NotNull(message = "Unidade obrigatoria")
        UnidadeMedida unidade,

        @NotNull(message = "Fator de correcao obrigatorio")
        @DecimalMin(value = "1.0", message = "Fator de correcao deve ser >= 1.0 (RN08)")
        BigDecimal fatorCorrecao
) {}
