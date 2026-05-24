package com.unasp.comandadigital.security;

import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + email));

        if (usuario.getStatus() == StatusGeral.INATIVO) {
            throw new UsernameNotFoundException("Usuario inativo: " + email);
        }

        return new User(
                usuario.getEmail(),
                usuario.getSenhaHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name()))
        );
    }
}
