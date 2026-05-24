package com.unasp.comandadigital.dto.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "Nome obrigatorio")
        @Size(max = 80, message = "Nome com no maximo 80 caracteres")
        String nome,

        @Size(max = 255, message = "Descricao com no maximo 255 caracteres")
        String descricao,

        Integer ordem
) {}
