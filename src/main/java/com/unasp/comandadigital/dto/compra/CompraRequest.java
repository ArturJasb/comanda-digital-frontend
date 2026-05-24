package com.unasp.comandadigital.dto.compra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CompraRequest(
        @NotNull(message = "ID do fornecedor obrigatorio")
        Long fornecedorId,

        @NotEmpty(message = "Pedido de compra deve ter pelo menos 1 item")
        @Valid
        List<CompraItemRequest> itens
) {}
