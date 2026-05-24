package com.unasp.comandadigital.controller;

import com.unasp.comandadigital.dto.auth.LoginRequest;
import com.unasp.comandadigital.dto.auth.LoginResponse;
import com.unasp.comandadigital.dto.auth.RegisterRequest;
import com.unasp.comandadigital.dto.usuario.UsuarioResponse;
import com.unasp.comandadigital.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacao", description = "Login e cadastro publico (sem JWT)")
@SecurityRequirements // sem seguranca
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login -- retorna JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request)); 
    }

    @PostMapping("/register")
    @Operation(summary = "Cadastro publico de cliente")
    public ResponseEntity<UsuarioResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
