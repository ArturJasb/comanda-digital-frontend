package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.EstoqueMovimentacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface EstoqueMovimentacaoRepository extends JpaRepository<EstoqueMovimentacao, Long> {

    Page<EstoqueMovimentacao> findByIngredienteIdOrderByCreatedAtDesc(Long ingredienteId, Pageable pageable);

    /**
     * Calcula o saldo de um ingrediente.
     * <p>Regra correta de sinais:</p>
     * <ul>
     *   <li>ENTRADA  -> soma (estoque entra)</li>
     *   <li>SAIDA    -> subtrai (estoque sai)</li>
     *   <li>ESTORNO  -> soma (devolve ao estoque o que foi tirado por uma SAIDA cancelada)</li>
     * </ul>
     */
    @Query("""
           SELECT COALESCE(SUM(
                    CASE
                        WHEN m.tipo = com.unasp.comandadigital.entity.enums.TipoMovimentacao.ENTRADA THEN  m.quantidade
                        WHEN m.tipo = com.unasp.comandadigital.entity.enums.TipoMovimentacao.ESTORNO THEN  m.quantidade
                        WHEN m.tipo = com.unasp.comandadigital.entity.enums.TipoMovimentacao.SAIDA   THEN -m.quantidade
                        ELSE 0
                    END
                  ), 0)
             FROM EstoqueMovimentacao m
            WHERE m.ingrediente.id = :ingredienteId
           """)
    BigDecimal calcularSaldo(@Param("ingredienteId") Long ingredienteId);

    /**
     * Top pratos mais vendidos por quantidade.
     * Retorna [prato_id, prato_nome, total_vendido].
     */
    @Query("""
           SELECT pi.prato.id, pi.prato.nome, SUM(pi.quantidade) AS total
             FROM PedidoItem pi
            WHERE pi.pedido.status <> com.unasp.comandadigital.entity.enums.StatusPedido.CANCELADO
            GROUP BY pi.prato.id, pi.prato.nome
            ORDER BY total DESC
           """)
    List<Object[]> findTopPratosMaisVendidos(Pageable pageable);
}
