package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.auth.LoginRequest;
import com.unasp.comandadigital.dto.auth.LoginResponse;
import com.unasp.comandadigital.dto.auth.RegisterRequest;
import com.unasp.comandadigital.dto.usuario.UsuarioResponse;
import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.Perfil;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.exception.ConflictException;
import com.unasp.comandadigital.repository.UsuarioRepository;
import com.unasp.comandadigital.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @Transactional
    public UsuarioResponse register(RegisterRequest request) {
        // RN10: email unico
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email ja cadastrado: " + request.email());
        }

        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .perfil(Perfil.CLIENTE) // cadastro publico SEMPRE cria CLIENTE
                .telefone(request.telefone())
                .endereco(request.endereco())
                .status(StatusGeral.ATIVO)
                .build();

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    public LoginResponse login(LoginRequest request) {
        // Valida credenciais (lanca BadCredentialsException se falhar)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(); // Garantido por loadUserByUsername

        String token = jwtUtil.generateToken(userDetails, usuario.getPerfil().name());

        return LoginResponse.of(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name()
        );
    }
}
