package com.unasp.comandadigital.dto.pedido;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PedidoItemRequest(
        @NotNull(message = "ID do prato obrigatorio")
        Long pratoId,

        @NotNull(message = "Quantidade obrigatoria")
        @Min(value = 1, message = "Quantidade minima e 1")
        Integer quantidade,

        @Size(max = 500, message = "Observacoes com no maximo 500 caracteres")
        String observacoes
) {}
