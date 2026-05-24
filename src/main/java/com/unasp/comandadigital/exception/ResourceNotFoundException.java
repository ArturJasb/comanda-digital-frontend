package com.unasp.comandadigital.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " nao encontrado(a) com id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
