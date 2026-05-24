package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.dashboard.DashboardResponse;
import com.unasp.comandadigital.dto.dashboard.TopPratoResponse;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.repository.EstoqueMovimentacaoRepository;
import com.unasp.comandadigital.repository.IngredienteRepository;
import com.unasp.comandadigital.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final IngredienteRepository ingredienteRepository;
    private final EstoqueMovimentacaoRepository movimentacaoRepository;
    private final IngredienteService ingredienteService;

    /** RF-34: KPIs do dia. */
    public DashboardResponse getResumo() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDia    = inicioDia.plusDays(1).minusNanos(1);

        BigDecimal faturamento = pedidoRepository.faturamentoDia(inicioDia, fimDia);
        Long totalPedidos      = pedidoRepository.countPedidosDia(inicioDia, fimDia);

        if (faturamento == null) faturamento = BigDecimal.ZERO;
        if (totalPedidos == null) totalPedidos = 0L;

        BigDecimal ticketMedio = BigDecimal.ZERO;
        if (totalPedidos > 0 && faturamento.compareTo(BigDecimal.ZERO) > 0) {
            ticketMedio = faturamento.divide(BigDecimal.valueOf(totalPedidos), 2, RoundingMode.HALF_UP);
        }

        long alertas = ingredienteRepository.findByStatus(StatusGeral.ATIVO).stream()
                .filter(i -> ingredienteService.getSaldo(i.getId()).compareTo(i.getEstoqueMinimo()) < 0)
                .count();

        List<TopPratoResponse> topPratos = getTopPratos(5);

        return new DashboardResponse(
                faturamento,
                totalPedidos,
                ticketMedio,
                (int) alertas,
                topPratos
        );
    }

    /** RF-35: top pratos mais vendidos. */
    public List<TopPratoResponse> getTopPratos(int limit) {
        int safeLimit = limit > 0 ? Math.min(limit, 50) : 5;
        return movimentacaoRepository
                .findTopPratosMaisVendidos(PageRequest.of(0, safeLimit))
                .stream()
                .map(row -> new TopPratoResponse(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }
}
