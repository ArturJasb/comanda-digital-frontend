package com.unasp.comandadigital.dto.prato;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PratoRequest(
        @NotBlank(message = "Nome obrigatorio")
        @Size(max = 100, message = "Nome com no maximo 100 caracteres")
        String nome,

        String descricao,

        @Size(max = 500, message = "URL da foto com no maximo 500 caracteres")
        String fotoUrl,

        @NotNull(message = "Preco de venda obrigatorio")
        @DecimalMin(value = "0.01", message = "Preco deve ser maior que zero")
        BigDecimal precoVenda,

        @Positive(message = "Tempo de preparo deve ser positivo")
        Integer tempoPreparoMin,

        @NotNull(message = "Categoria obrigatoria")
        Long categoriaId
) {}
