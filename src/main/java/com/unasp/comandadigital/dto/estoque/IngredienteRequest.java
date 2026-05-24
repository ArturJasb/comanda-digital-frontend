package com.unasp.comandadigital.dto.estoque;

import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IngredienteRequest(
        @NotBlank(message = "Nome obrigatorio")
        @Size(max = 100, message = "Nome com no maximo 100 caracteres")
        String nome,

        @Size(max = 50, message = "SKU com no maximo 50 caracteres")
        String sku,

        @NotNull(message = "Unidade padrao obrigatoria")
        UnidadeMedida unidadePadrao,

        @DecimalMin(value = "0.0", message = "Estoque minimo nao pode ser negativo")
        BigDecimal estoqueMinimo,

        @DecimalMin(value = "0.0", message = "Custo unitario nao pode ser negativo")
        BigDecimal custoUnitario
) {}
