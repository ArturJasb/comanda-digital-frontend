package com.unasp.comandadigital.dto.pedido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelamentoRequest(
        @NotBlank(message = "Motivo do cancelamento obrigatorio")
        @Size(max = 500, message = "Motivo com no maximo 500 caracteres")
        String motivo
) {}
