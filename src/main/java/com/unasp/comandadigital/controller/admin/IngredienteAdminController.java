package com.unasp.comandadigital.controller.admin;

import com.unasp.comandadigital.dto.estoque.IngredienteRequest;
import com.unasp.comandadigital.dto.estoque.IngredienteResponse;
import com.unasp.comandadigital.dto.estoque.MovimentacaoRequest;
import com.unasp.comandadigital.dto.estoque.MovimentacaoResponse;
import com.unasp.comandadigital.service.EstoqueService;
import com.unasp.comandadigital.service.IngredienteService;
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

import java.util.List;

@RestController
@RequestMapping("/api/admin/ingredientes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
@Tag(name = "Admin -- Ingredientes & Estoque")
public class IngredienteAdminController {

    private final IngredienteService ingredienteService;
    private final EstoqueService estoqueService;

    @GetMapping
    public ResponseEntity<Page<IngredienteResponse>> listar(
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(ingredienteService.listar(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredienteResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ingredienteService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<IngredienteResponse> criar(@Valid @RequestBody IngredienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredienteService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredienteResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody IngredienteRequest request) {
        return ResponseEntity.ok(ingredienteService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        ingredienteService.desativar(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- Estoque --------------------

    @GetMapping("/estoque/saldo")
    @Operation(summary = "Saldo atual de todos os ingredientes")
    public ResponseEntity<List<IngredienteResponse>> saldo() {
        return ResponseEntity.ok(ingredienteService.saldoTodos());
    }

    @GetMapping("/estoque/alertas")
    @Operation(summary = "Ingredientes abaixo do estoque minimo")
    public ResponseEntity<List<IngredienteResponse>> alertas() {
        return ResponseEntity.ok(ingredienteService.listarComAlertas());
    }

    @GetMapping("/{id}/movimentacoes")
    @Operation(summary = "Historico de movimentacoes do ingrediente (paginado)")
    public ResponseEntity<Page<MovimentacaoResponse>> movimentacoes(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(estoqueService.listarPorIngrediente(id, pageable));
    }

    @PostMapping("/estoque/movimentacao")
    @Operation(summary = "Registrar saida manual (perda, desperdicio, etc.)")
    public ResponseEntity<MovimentacaoResponse> saidaManual(
            @Valid @RequestBody MovimentacaoRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(estoqueService.registrarSaidaManualPorEmail(request, user.getUsername()));
    }
}
