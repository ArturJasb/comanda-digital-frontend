package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.usuario.UsuarioRequest;
import com.unasp.comandadigital.dto.usuario.UsuarioResponse;
import com.unasp.comandadigital.entity.Usuario;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.ConflictException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UsuarioResponse> listarTodos(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(UsuarioResponse::from);
    }

    public UsuarioResponse buscarPorId(Long id) {
        return UsuarioResponse.from(buscar(id));
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        // RN10: email unico
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email ja cadastrado: " + request.email());
        }
        if (request.senha() == null || request.senha().isBlank()) {
            throw new BusinessException("Senha obrigatoria para criacao de usuario");
        }

        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .perfil(request.perfil())
                .telefone(request.telefone())
                .endereco(request.endereco())
                .status(StatusGeral.ATIVO)
                .build();

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioRequest request) {
        Usuario usuario = buscar(id);

        if (!usuario.getEmail().equals(request.email())
                && usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email ja cadastrado: " + request.email());
        }

        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setPerfil(request.perfil());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());

        // Senha so e atualizada se fornecida
        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    /** RN06: exclusao logica (soft delete). */
    @Transactional
    public void desativar(Long id) {
        Usuario usuario = buscar(id);
        usuario.setStatus(StatusGeral.INATIVO);
        usuarioRepository.save(usuario);
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }
}
