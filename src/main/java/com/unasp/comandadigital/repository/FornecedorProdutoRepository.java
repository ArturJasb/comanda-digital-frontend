package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.FornecedorProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FornecedorProdutoRepository extends JpaRepository<FornecedorProduto, Long> {

    List<FornecedorProduto> findByFornecedorId(Long fornecedorId);

    Optional<FornecedorProduto> findByFornecedorIdAndIngredienteId(Long fornecedorId, Long ingredienteId);

    /**
     * Cotacao comparativa: retorna todos os fornecedores ATIVOS que vendem o ingrediente,
     * ordenados pelo menor preco (RF-23).
     */
    @Query("""
           SELECT fp FROM FornecedorProduto fp
            WHERE fp.ingrediente.id = :ingredienteId
              AND fp.fornecedor.status = com.unasp.comandadigital.entity.enums.StatusGeral.ATIVO
            ORDER BY fp.preco ASC
           """)
    List<FornecedorProduto> findCotacaoPorIngrediente(@Param("ingredienteId") Long ingredienteId);
}
