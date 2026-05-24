package com.unasp.comandadigital.exception;

/**
 * Excecao para conflito de dados (ex: email duplicado, CNPJ duplicado).
 * Mapeada para HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
