package com.unasp.comandadigital.dto.pedido;

import com.unasp.comandadigital.entity.enums.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status obrigatorio")
        StatusPedido status
) {}
