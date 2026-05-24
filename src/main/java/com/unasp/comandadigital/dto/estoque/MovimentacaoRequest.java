package com.unasp.comandadigital.dto.estoque;

import com.unasp.comandadigital.entity.enums.MotivoMovimentacao;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoRequest(
        @NotNull(message = "ID do ingrediente obrigatorio")
        Long ingredienteId,

        @NotNull(message = "Quantidade obrigatoria")
        @DecimalMin(value = "0.0001", message = "Quantidade deve ser maior que zero")
        BigDecimal quantidade,

        @NotNull(message = "Motivo obrigatorio")
        MotivoMovimentacao motivo,

        String lote,

        LocalDate validade
) {}
