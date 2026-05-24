package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.Pedido;
import com.unasp.comandadigital.entity.enums.StatusPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Page<Pedido> findByClienteIdOrderByCreatedAtDesc(Long clienteId, Pageable pageable);

    @Query("""
           SELECT p FROM Pedido p
            WHERE (:status     IS NULL OR p.status     = :status)
              AND (:dataInicio IS NULL OR p.createdAt >= :dataInicio)
              AND (:dataFim    IS NULL OR p.createdAt <= :dataFim)
            ORDER BY p.createdAt DESC
           """)
    Page<Pedido> findWithFilters(@Param("status") StatusPedido status,
                                 @Param("dataInicio") LocalDateTime dataInicio,
                                 @Param("dataFim") LocalDateTime dataFim,
                                 Pageable pageable);

    @Query("""
           SELECT COUNT(p) FROM Pedido p
            WHERE p.createdAt BETWEEN :inicio AND :fim
              AND p.status <> com.unasp.comandadigital.entity.enums.StatusPedido.CANCELADO
           """)
    Long countPedidosDia(@Param("inicio") LocalDateTime inicio,
                         @Param("fim") LocalDateTime fim);

    @Query("""
           SELECT COALESCE(SUM(p.valorTotal), 0) FROM Pedido p
            WHERE p.createdAt BETWEEN :inicio AND :fim
              AND p.status <> com.unasp.comandadigital.entity.enums.StatusPedido.CANCELADO
           """)
    BigDecimal faturamentoDia(@Param("inicio") LocalDateTime inicio,
                              @Param("fim") LocalDateTime fim);
}
