package com.unasp.comandadigital.controller.admin;

import com.unasp.comandadigital.dto.categoria.CategoriaRequest;
import com.unasp.comandadigital.dto.categoria.CategoriaResponse;
import com.unasp.comandadigital.service.CategoriaService;
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
@RequestMapping("/api/admin/categorias")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
@Tag(name = "Admin -- Categorias")
public class CategoriaAdminController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<Page<CategoriaResponse>> listar(
            @PageableDefault(size = 20, sort = "ordem") Pageable pageable) {
        return ResponseEntity.ok(categoriaService.listarTodas(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        categoriaService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
