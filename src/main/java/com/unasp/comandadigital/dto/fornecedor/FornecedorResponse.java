package com.unasp.comandadigital.dto.fornecedor;

import com.unasp.comandadigital.entity.Fornecedor;
import com.unasp.comandadigital.entity.enums.StatusGeral;

public record FornecedorResponse(
        Long id,
        String razaoSocial,
        String cnpj,
        String telefone,
        String email,
        StatusGeral status
) {
    public static FornecedorResponse from(Fornecedor f) {
        return new FornecedorResponse(
                f.getId(),
                f.getRazaoSocial(),
                f.getCnpj(),
                f.getTelefone(),
                f.getEmail(),
                f.getStatus()
        );
    }
}
