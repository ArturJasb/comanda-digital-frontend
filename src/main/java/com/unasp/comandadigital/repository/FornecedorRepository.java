package com.unasp.comandadigital.repository;

import com.unasp.comandadigital.entity.Fornecedor;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {

    boolean existsByCnpj(String cnpj);

    Page<Fornecedor> findByStatus(StatusGeral status, Pageable pageable);
}
