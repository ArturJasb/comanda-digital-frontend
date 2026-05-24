package com.unasp.comandadigital.controller.admin;

import com.unasp.comandadigital.dto.prato.CustoResponse;
import com.unasp.comandadigital.dto.prato.FichaTecnicaRequest;
import com.unasp.comandadigital.dto.prato.FichaTecnicaResponse;
import com.unasp.comandadigital.dto.prato.PratoRequest;
import com.unasp.comandadigital.dto.prato.PratoResponse;
import com.unasp.comandadigital.entity.enums.StatusPrato;
import com.unasp.comandadigital.service.FichaTecnicaService;
import com.unasp.comandadigital.service.PratoService;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/pratos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
@Tag(name = "Admin -- Pratos & Fichas Tecnicas")
public class PratoAdminController {

    private final PratoService pratoService;
    private final FichaTecnicaService fichaTecnicaService;

    @GetMapping
    public ResponseEntity<Page<PratoResponse>> listar(
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(pratoService.listarAdmin(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PratoResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(pratoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PratoResponse> criar(@Valid @RequestBody PratoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pratoService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PratoResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody PratoRequest request) {
        return ResponseEntity.ok(pratoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alterar status do prato (ATIVO/INATIVO/PAUSADO)")
    public ResponseEntity<PratoResponse> alterarStatus(
            @PathVariable Long id, @RequestParam StatusPrato status) {
        return ResponseEntity.ok(pratoService.alterarStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        pratoService.desativar(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------- Ficha Tecnica --------------------

    @GetMapping("/{id}/ficha")
    @Operation(summary = "Buscar ficha tecnica do prato")
    public ResponseEntity<FichaTecnicaResponse> buscarFicha(@PathVariable Long id) {
        return ResponseEntity.ok(fichaTecnicaService.buscarPorPrato(id));
    }

    @PostMapping("/{id}/ficha")
    @Operation(summary = "Criar ou atualizar ficha tecnica (calcula custo automaticamente)")
    public ResponseEntity<FichaTecnicaResponse> salvarFicha(
            @PathVariable Long id, @Valid @RequestBody FichaTecnicaRequest request) {
        return ResponseEntity.ok(fichaTecnicaService.salvar(id, request));
    }

    @PutMapping("/{id}/ficha")
    @Operation(summary = "Atualizar ficha tecnica (alias para POST)")
    public ResponseEntity<FichaTecnicaResponse> atualizarFicha(
            @PathVariable Long id, @Valid @RequestBody FichaTecnicaRequest request) {
        return ResponseEntity.ok(fichaTecnicaService.salvar(id, request));
    }

    @GetMapping("/{id}/custo")
    @Operation(summary = "Calcular custo e food cost do prato")
    public ResponseEntity<CustoResponse> calcularCusto(@PathVariable Long id) {
        return ResponseEntity.ok(fichaTecnicaService.calcularCusto(id));
    }
}
