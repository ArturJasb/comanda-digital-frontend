package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.Categoria;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByStatusOrderByOrdemAsc(StatusGeral status);
}
