package com.unasp.comandadigital.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Nome obrigatorio")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome,

        @NotBlank(message = "Email obrigatorio")
        @Email(message = "Email invalido")
        String email,

        @NotBlank(message = "Senha obrigatoria")
        @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
        String senha,

        String telefone,

        String endereco
) {}
