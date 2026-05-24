package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.Prato;
import com.unasp.comandadigital.entity.enums.StatusPrato;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PratoRepository extends JpaRepository<Prato, Long> {

    Page<Prato> findByStatus(StatusPrato status, Pageable pageable);

    @Query("""
           SELECT p FROM Prato p
            WHERE p.status = :status
              AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
            ORDER BY p.categoria.ordem ASC, p.nome ASC
           """)
    List<Prato> findAtivosComFiltro(@Param("status") StatusPrato status,
                                    @Param("categoriaId") Long categoriaId);
}
