package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.estoque.IngredienteRequest;
import com.unasp.comandadigital.dto.estoque.IngredienteResponse;
import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.exception.ConflictException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.EstoqueMovimentacaoRepository;
import com.unasp.comandadigital.repository.IngredienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IngredienteService {

    private final IngredienteRepository ingredienteRepository;
    private final EstoqueMovimentacaoRepository movimentacaoRepository;

    public Page<IngredienteResponse> listar(Pageable pageable) {
        return ingredienteRepository.findAll(pageable)
                .map(i -> IngredienteResponse.from(i, getSaldo(i.getId())));
    }

    /** RF-32: lista ingredientes abaixo do estoque minimo. */
    public List<IngredienteResponse> listarComAlertas() {
        return ingredienteRepository.findByStatus(StatusGeral.ATIVO).stream()
                .map(i -> IngredienteResponse.from(i, getSaldo(i.getId())))
                .filter(IngredienteResponse::alertaMinimo)
                .toList();
    }

    /** RF-31: saldo de todos os ingredientes ATIVOS. */
    public List<IngredienteResponse> saldoTodos() {
        return ingredienteRepository.findByStatus(StatusGeral.ATIVO).stream()
                .map(i -> IngredienteResponse.from(i, getSaldo(i.getId())))
                .toList();
    }

    public IngredienteResponse buscarPorId(Long id) {
        Ingrediente i = buscar(id);
        return IngredienteResponse.from(i, getSaldo(id));
    }

    @Transactional
    public IngredienteResponse criar(IngredienteRequest request) {
        if (request.sku() != null && !request.sku().isBlank()
                && ingredienteRepository.findBySku(request.sku()).isPresent()) {
            throw new ConflictException("SKU ja cadastrado: " + request.sku());
        }

        Ingrediente ingrediente = Ingrediente.builder()
                .nome(request.nome())
                .sku(request.sku())
                .unidadePadrao(request.unidadePadrao())
                .estoqueMinimo(request.estoqueMinimo() != null ? request.estoqueMinimo() : BigDecimal.ZERO)
                .custoUnitario(request.custoUnitario() != null ? request.custoUnitario() : BigDecimal.ZERO)
                .status(StatusGeral.ATIVO)
                .build();

        Ingrediente saved = ingredienteRepository.save(ingrediente);
        return IngredienteResponse.from(saved, BigDecimal.ZERO);
    }

    @Transactional
    public IngredienteResponse atualizar(Long id, IngredienteRequest request) {
        Ingrediente ingrediente = buscar(id);

        if (request.sku() != null && !request.sku().equals(ingrediente.getSku())) {
            ingredienteRepository.findBySku(request.sku()).ifPresent(i -> {
                throw new ConflictException("SKU ja cadastrado: " + request.sku());
            });
        }

        ingrediente.setNome(request.nome());
        ingrediente.setSku(request.sku());
        ingrediente.setUnidadePadrao(request.unidadePadrao());
        if (request.estoqueMinimo() != null) {
            ingrediente.setEstoqueMinimo(request.estoqueMinimo());
        }
        if (request.custoUnitario() != null) {
            ingrediente.setCustoUnitario(request.custoUnitario());
        }

        return IngredienteResponse.from(ingredienteRepository.save(ingrediente), getSaldo(id));
    }

    /** RN06: exclusao logica. */
    @Transactional
    public void desativar(Long id) {
        Ingrediente ingrediente = buscar(id);
        ingrediente.setStatus(StatusGeral.INATIVO);
        ingredienteRepository.save(ingrediente);
    }

    public Ingrediente buscar(Long id) {
        return ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente", id));
    }

    /**
     * Saldo em tempo real do ingrediente (RF-31).
     * ENTRADA + ESTORNO - SAIDA (regra corrigida).
     */
    public BigDecimal getSaldo(Long ingredienteId) {
        BigDecimal saldo = movimentacaoRepository.calcularSaldo(ingredienteId);
        return saldo != null ? saldo : BigDecimal.ZERO;
    }
}
