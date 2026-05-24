package com.unasp.comandadigital.controller.admin;

import com.unasp.comandadigital.dto.compra.CompraRequest;
import com.unasp.comandadigital.dto.compra.CompraResponse;
import com.unasp.comandadigital.entity.enums.StatusCompra;
import com.unasp.comandadigital.service.CompraService;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/compras")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
@Tag(name = "Admin -- Pedidos de Compra")
public class CompraAdminController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<Page<CompraResponse>> listar(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(compraService.listar(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar pedido de compra (RASCUNHO)")
    public ResponseEntity<CompraResponse> criar(
            @Valid @RequestBody CompraRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(compraService.criar(request, user.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar pedido de compra (apenas RASCUNHO)")
    public ResponseEntity<CompraResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CompraRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(compraService.atualizar(id, request, user.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Avancar status: RASCUNHO -> ENVIADO ou CANCELADO (para RECEBIDO usar /receber)")
    public ResponseEntity<CompraResponse> alterarStatus(
            @PathVariable Long id,
            @RequestParam StatusCompra status,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(compraService.alterarStatus(id, status, user.getUsername()));
    }

    @PostMapping("/{id}/receber")
    @Operation(summary = "Registrar recebimento: cria entrada no estoque e atualiza custo do ingrediente")
    public ResponseEntity<CompraResponse> receber(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(compraService.receberMercadoria(id, user.getUsername()));
    }
}
