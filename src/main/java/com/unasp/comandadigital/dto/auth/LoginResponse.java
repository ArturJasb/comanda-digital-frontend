package com.unasp.comandadigital.dto.auth;

public record LoginResponse(
        String token,
        String tipo,
        Long usuarioId,
        String nome,
        String email,
        String perfil
) {
    public static LoginResponse of(String token, Long id, String nome, String email, String perfil) {
        return new LoginResponse(token, "Bearer", id, nome, email, perfil);
    }
}
