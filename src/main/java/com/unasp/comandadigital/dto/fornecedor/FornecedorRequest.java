package com.unasp.comandadigital.dto.fornecedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FornecedorRequest(
        @NotBlank(message = "Razao social obrigatoria")
        @Size(max = 150, message = "Razao social com no maximo 150 caracteres")
        String razaoSocial,

        @NotBlank(message = "CNPJ obrigatorio")
        String cnpj,

        @Size(max = 20, message = "Telefone com no maximo 20 caracteres")
        String telefone,

        @Email(message = "Email invalido")
        @Size(max = 150, message = "Email com no maximo 150 caracteres")
        String email
) {}
