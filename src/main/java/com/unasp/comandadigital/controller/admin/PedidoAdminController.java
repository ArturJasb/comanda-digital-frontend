package com.unasp.comandadigital.controller.admin;

import com.unasp.comandadigital.dto.pedido.CancelamentoRequest;
import com.unasp.comandadigital.dto.pedido.PedidoResponse;
import com.unasp.comandadigital.dto.pedido.StatusUpdateRequest;
import com.unasp.comandadigital.entity.enums.StatusPedido;
import com.unasp.comandadigital.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/pedidos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','GERENTE','COZINHEIRO')")
@Tag(name = "Admin -- Pedidos & Cozinha")
public class PedidoAdminController {

    private final PedidoService pedidoService;

    @GetMapping
    @Operation(summary = "Listar todos os pedidos com filtros (paginado)")
    public ResponseEntity<Page<PedidoResponse>> listar(
            @RequestParam(required = false) StatusPedido status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(pedidoService.listarTodos(status, dataInicio, dataFim, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe do pedido")
    public ResponseEntity<PedidoResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mudar status (CONFIRMADO inicia baixa de estoque)")
    public ResponseEntity<PedidoResponse> alterarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pedidoService.alterarStatus(id, request, user.getUsername()));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    @Operation(summary = "Cancelar pedido com motivo (apos EM_PREPARO so ADMIN/GERENTE)")
    public ResponseEntity<PedidoResponse> cancelar(
            @PathVariable Long id,
            @Valid @RequestBody CancelamentoRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pedidoService.cancelar(id, request, user.getUsername()));
    }
}
