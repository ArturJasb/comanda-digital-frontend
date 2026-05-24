package com.unasp.comandadigital.dto.usuario;

import com.unasp.comandadigital.entity.enums.Perfil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
        @NotBlank(message = "Nome obrigatorio")
        @Size(max = 100, message = "Nome com no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "Email obrigatorio")
        @Email(message = "Email invalido")
        @Size(max = 150, message = "Email com no maximo 150 caracteres")
        String email,

        /** Obrigatoria na criacao, opcional no update. */
        String senha,

        @NotNull(message = "Perfil obrigatorio")
        Perfil perfil,

        @Size(max = 20, message = "Telefone com no maximo 20 caracteres")
        String telefone,

        @Size(max = 255, message = "Endereco com no maximo 255 caracteres")
        String endereco
) {}
