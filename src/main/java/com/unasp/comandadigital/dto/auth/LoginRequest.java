package com.unasp.comandadigital.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email obrigatorio")
        @Email(message = "Email invalido")
        String email,

        @NotBlank(message = "Senha obrigatoria")
        String senha
) {}
