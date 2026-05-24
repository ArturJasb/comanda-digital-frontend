package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.prato.CustoResponse;
import com.unasp.comandadigital.dto.prato.FichaTecnicaItemRequest;
import com.unasp.comandadigital.dto.prato.FichaTecnicaItemResponse;
import com.unasp.comandadigital.dto.prato.FichaTecnicaRequest;
import com.unasp.comandadigital.dto.prato.FichaTecnicaResponse;
import com.unasp.comandadigital.entity.FichaTecnica;
import com.unasp.comandadigital.entity.FichaTecnicaItem;
import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.Prato;
import com.unasp.comandadigital.entity.enums.StatusPrato;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.FichaTecnicaRepository;
import com.unasp.comandadigital.repository.IngredienteRepository;
import com.unasp.comandadigital.repository.PratoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FichaTecnicaService {

    private static final BigDecimal FOOD_COST_VERDE   = new BigDecimal("30");
    private static final BigDecimal FOOD_COST_AMARELO = new BigDecimal("35");

    private final FichaTecnicaRepository fichaTecnicaRepository;
    private final PratoRepository pratoRepository;
    private final IngredienteRepository ingredienteRepository;

    public FichaTecnicaResponse buscarPorPrato(Long pratoId) {
        FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(pratoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ficha tecnica nao encontrada para o prato " + pratoId));
        return toResponse(ficha);
    }

    public CustoResponse calcularCusto(Long pratoId) {
        Prato prato = pratoRepository.findById(pratoId)
                .orElseThrow(() -> new ResourceNotFoundException("Prato", pratoId));

        FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(pratoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ficha tecnica nao encontrada para o prato " + pratoId));

        BigDecimal custo = calcularCustoTotal(ficha);
        BigDecimal foodCost = calcularFoodCost(custo, prato.getPrecoVenda());

        return new CustoResponse(
                prato.getId(),
                prato.getNome(),
                prato.getPrecoVenda(),
                custo,
                foodCost,
                classificarFoodCost(foodCost)
        );
    }

    @Transactional
    public FichaTecnicaResponse salvar(Long pratoId, FichaTecnicaRequest request) {
        Prato prato = pratoRepository.findById(pratoId)
                .orElseThrow(() -> new ResourceNotFoundException("Prato", pratoId));

        FichaTecnica ficha = fichaTecnicaRepository.findByPratoId(pratoId)
                .orElseGet(() -> FichaTecnica.builder()
                        .prato(prato)
                        .itens(new ArrayList<>())
                        .build());

        ficha.setRendimento(request.rendimento());
        ficha.setModoPreparo(request.modoPreparo());
        ficha.getItens().clear();

        for (FichaTecnicaItemRequest itemReq : request.itens()) {
            Ingrediente ingrediente = ingredienteRepository.findById(itemReq.ingredienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ingrediente", itemReq.ingredienteId()));

            // RN08: fator de correcao >= 1.0 (defesa extra, ja validado no DTO)
            if (itemReq.fatorCorrecao().compareTo(BigDecimal.ONE) < 0) {
                throw new BusinessException(
                        "Fator de correcao deve ser >= 1.0 para: " + ingrediente.getNome());
            }

            FichaTecnicaItem item = FichaTecnicaItem.builder()
                    .fichaTecnica(ficha)
                    .ingrediente(ingrediente)
                    .quantidade(itemReq.quantidade())
                    .unidade(itemReq.unidade())
                    .fatorCorrecao(itemReq.fatorCorrecao())
                    .build();

            ficha.getItens().add(item);
        }

        FichaTecnica saved = fichaTecnicaRepository.save(ficha);

        // RN01: ativa o prato automaticamente quando a ficha for criada
        if (prato.getStatus() == StatusPrato.INATIVO && !saved.getItens().isEmpty()) {
            prato.setStatus(StatusPrato.ATIVO);
            pratoRepository.save(prato);
        }

        return toResponse(saved);
    }

    /** Formula (SRS RF-12): SUM(qtd * fator_correcao * custo_unitario) / rendimento. */
    public BigDecimal calcularCustoTotal(FichaTecnica ficha) {
        BigDecimal soma = ficha.getItens().stream()
                .map(item -> item.getQuantidade()
                        .multiply(item.getFatorCorrecao())
                        .multiply(item.getIngrediente().getCustoUnitario()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int rendimento = ficha.getRendimento() != null && ficha.getRendimento() > 0 ? ficha.getRendimento() : 1;
        return soma.divide(BigDecimal.valueOf(rendimento), 4, RoundingMode.HALF_UP);
    }

    /** RF-13: food_cost = (custo / preco_venda) * 100. */
    private BigDecimal calcularFoodCost(BigDecimal custo, BigDecimal precoVenda) {
        if (precoVenda == null || precoVenda.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return custo.divide(precoVenda, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /** RF-13: classificacao por cor (<=30% verde, 31-35% amarelo, >35% vermelho). */
    private String classificarFoodCost(BigDecimal foodCost) {
        if (foodCost.compareTo(FOOD_COST_VERDE) <= 0) {
            return "VERDE";
        }
        if (foodCost.compareTo(FOOD_COST_AMARELO) <= 0) {
            return "AMARELO";
        }
        return "VERMELHO";
    }

    private FichaTecnicaResponse toResponse(FichaTecnica ficha) {
        List<FichaTecnicaItemResponse> itensResp = ficha.getItens().stream()
                .map(FichaTecnicaItemResponse::from)
                .toList();

        BigDecimal custo = calcularCustoTotal(ficha);
        BigDecimal foodCost = calcularFoodCost(custo, ficha.getPrato().getPrecoVenda());
        String classificacao = classificarFoodCost(foodCost);

        // RN02: aviso se food cost > 35%
        String aviso = foodCost.compareTo(FOOD_COST_AMARELO) > 0
                ? "Food cost acima de 35%. Revise os custos ou o preco de venda."
                : null;

        return new FichaTecnicaResponse(
                ficha.getId(),
                ficha.getPrato().getId(),
                ficha.getPrato().getNome(),
                ficha.getRendimento(),
                ficha.getModoPreparo(),
                itensResp,
                custo,
                foodCost,
                classificacao,
                aviso
        );
    }
}
