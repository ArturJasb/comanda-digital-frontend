package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.FichaTecnica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FichaTecnicaRepository extends JpaRepository<FichaTecnica, Long> {

    Optional<FichaTecnica> findByPratoId(Long pratoId);

    boolean existsByPratoId(Long pratoId);
}
