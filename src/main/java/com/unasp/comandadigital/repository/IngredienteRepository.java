package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {

    Optional<Ingrediente> findBySku(String sku);

    List<Ingrediente> findByStatus(StatusGeral status);
}
