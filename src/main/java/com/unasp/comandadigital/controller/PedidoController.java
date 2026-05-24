package com.unasp.comandadigital.controller;

import com.unasp.comandadigital.dto.pedido.CancelamentoRequest;
import com.unasp.comandadigital.dto.pedido.PedidoRequest;
import com.unasp.comandadigital.dto.pedido.PedidoResponse;
import com.unasp.comandadigital.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
@Tag(name = "Pedidos -- Cliente", description = "Criar pedido e acompanhar status")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @Operation(summary = "Criar pedido (checkout)")
    public ResponseEntity<PedidoResponse> criar(
            @Valid @RequestBody PedidoRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.criar(request, user.getUsername()));
    }

    @GetMapping("/meus")
    @Operation(summary = "Historico de pedidos do cliente logado")
    public ResponseEntity<Page<PedidoResponse>> meusPedidos(
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(pedidoService.listarMeusPedidos(user.getUsername(), pageable));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Status atual do pedido (somente o dono)")
    public ResponseEntity<PedidoResponse> status(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pedidoService.buscarStatus(id, user.getUsername()));
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cliente cancela o proprio pedido (antes de EM_PREPARO)")
    public ResponseEntity<PedidoResponse> cancelar(
            @PathVariable Long id,
            @Valid @RequestBody CancelamentoRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pedidoService.cancelar(id, request, user.getUsername()));
    }
}
