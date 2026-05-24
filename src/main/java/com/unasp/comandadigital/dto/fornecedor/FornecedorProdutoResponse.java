package com.unasp.comandadigital.dto.fornecedor;

import com.unasp.comandadigital.entity.FornecedorProduto;
import com.unasp.comandadigital.entity.enums.UnidadeMedida;

import java.math.BigDecimal;

public record FornecedorProdutoResponse(
        Long id,
        Long fornecedorId,
        String fornecedorNome,
        Long ingredienteId,
        String ingredienteNome,
        BigDecimal preco,
        UnidadeMedida unidadeVenda
) {
    public static FornecedorProdutoResponse from(FornecedorProduto fp) {
        return new FornecedorProdutoResponse(
                fp.getId(),
                fp.getFornecedor().getId(),
                fp.getFornecedor().getRazaoSocial(),
                fp.getIngrediente().getId(),
                fp.getIngrediente().getNome(),
                fp.getPreco(),
                fp.getUnidadeVenda()
        );
    }
}
