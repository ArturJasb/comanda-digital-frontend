package com.unasp.comandadigital.controller;

import com.unasp.comandadigital.dto.categoria.CategoriaResponse;
import com.unasp.comandadigital.dto.prato.PratoResponse;
import com.unasp.comandadigital.service.CategoriaService;
import com.unasp.comandadigital.service.PratoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cardapio")
@RequiredArgsConstructor
@Tag(name = "Cardapio Publico", description = "Endpoints publicos -- sem autenticacao")
@SecurityRequirements
public class CardapioController {

    private final PratoService pratoService;
    private final CategoriaService categoriaService;

    @GetMapping
    @Operation(summary = "Lista pratos ativos com filtro opcional por categoria")
    public ResponseEntity<List<PratoResponse>> listar(
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(pratoService.listarAtivosParaCardapio(categoriaId));
    }

    @GetMapping("/categorias")
    @Operation(summary = "Lista categorias ativas")
    public ResponseEntity<List<CategoriaResponse>> categorias() {
        return ResponseEntity.ok(categoriaService.listarAtivas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe de um prato")
    public ResponseEntity<PratoResponse> detalhe(@PathVariable Long id) {
        return ResponseEntity.ok(pratoService.buscarPorId(id));
    }
}
