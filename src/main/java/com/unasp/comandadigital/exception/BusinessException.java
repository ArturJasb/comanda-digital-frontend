package com.unasp.comandadigital.exception;

/**
 * Excecao para violacao de regra de negocio.
 * Mapeada para HTTP 422 (Unprocessable Entity).
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
