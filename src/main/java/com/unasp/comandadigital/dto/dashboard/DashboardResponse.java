package com.unasp.comandadigital.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal faturamentoDia,
        Long totalPedidos,
        BigDecimal ticketMedio,
        int ingredientesEmAlerta,
        List<TopPratoResponse> topPratos
) {}
