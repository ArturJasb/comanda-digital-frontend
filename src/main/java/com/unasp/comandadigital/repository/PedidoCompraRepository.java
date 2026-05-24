package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.PedidoCompra;
import com.unasp.comandadigital.entity.enums.StatusCompra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {

    Page<PedidoCompra> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<PedidoCompra> findByStatusOrderByCreatedAtDesc(StatusCompra status, Pageable pageable);
}
