package com.unasp.comandadigital.dto.fornecedor;

import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FornecedorProdutoRequest(
        @NotNull(message = "ID do ingrediente obrigatorio")
        Long ingredienteId,

        @NotNull(message = "Preco obrigatorio")
        @DecimalMin(value = "0.0001", message = "Preco deve ser maior que zero")
        BigDecimal preco,

        @NotNull(message = "Unidade de venda obrigatoria")
        UnidadeMedida unidadeVenda
) {}
