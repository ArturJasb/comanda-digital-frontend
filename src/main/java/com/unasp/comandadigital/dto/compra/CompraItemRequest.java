package com.unasp.comandadigital.dto.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CompraItemRequest(
        @NotNull(message = "ID do ingrediente obrigatorio")
        Long ingredienteId,

        @NotNull(message = "Quantidade obrigatoria")
        @DecimalMin(value = "0.0001", message = "Quantidade deve ser maior que zero")
        BigDecimal quantidade,

        @NotNull(message = "Preco unitario obrigatorio")
        @DecimalMin(value = "0.0001", message = "Preco deve ser maior que zero")
        BigDecimal precoUnitario
) {}
