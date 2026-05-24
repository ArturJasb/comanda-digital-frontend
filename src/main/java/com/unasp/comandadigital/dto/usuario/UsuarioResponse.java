package com.unasp.comandadigital.dto.usuario;

import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.Perfil;
import com.unasp.comandadigital.entity.enums.StatusGeral;

import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        Perfil perfil,
        String telefone,
        String endereco,
        StatusGeral status,
        LocalDateTime createdAt
) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPerfil(),
                u.getTelefone(),
                u.getEndereco(),
                u.getStatus(),
                u.getCreatedAt()
        );
    }
}
