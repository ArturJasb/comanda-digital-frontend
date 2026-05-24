package com.unasp.comandadigital.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PedidoRequest(
        @NotEmpty(message = "Pedido deve ter pelo menos 1 item")
        @Valid
        List<PedidoItemRequest> itens,

        @Size(max = 255, message = "Endereco com no maximo 255 caracteres")
        String enderecoEntrega,

        @Size(max = 500, message = "Observacoes com no maximo 500 caracteres")
        String observacoes
) {}
