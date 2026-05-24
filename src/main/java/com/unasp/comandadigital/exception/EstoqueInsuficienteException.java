package com.unasp.comandadigital.exception;

import java.math.BigDecimal;

/**
 * Lancada quando o saldo de estoque e insuficiente para uma operacao (RN03).
 */
public class EstoqueInsuficienteException extends RuntimeException {

    public EstoqueInsuficienteException(String ingrediente, BigDecimal saldoAtual, BigDecimal necessario) {
        super(String.format("Estoque insuficiente para '%s'. Disponivel: %s | Necessario: %s",
                ingrediente, saldoAtual.toPlainString(), necessario.toPlainString()));
    }
}
