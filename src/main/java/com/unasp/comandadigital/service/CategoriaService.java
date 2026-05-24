package com.unasp.comandadigital.service;

import com.unasp.comandadigital.dto.categoria.CategoriaRequest;
import com.unasp.comandadigital.dto.categoria.CategoriaResponse;
import com.unasp.comandadigital.entity.Categoria;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaResponse> listarAtivas() {
        return categoriaRepository.findByStatusOrderByOrdemAsc(StatusGeral.ATIVO)
                .stream().map(CategoriaResponse::from).toList();
    }

    public Page<CategoriaResponse> listarTodas(Pageable pageable) {
        return categoriaRepository.findAll(pageable).map(CategoriaResponse::from);
    }

    public CategoriaResponse buscarPorId(Long id) {
        return CategoriaResponse.from(buscar(id));
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        Categoria categoria = Categoria.builder()
                .nome(request.nome())
                .descricao(request.descricao())
                .ordem(request.ordem())
                .status(StatusGeral.ATIVO)
                .build();
        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        categoria.setNome(request.nome());
        categoria.setDescricao(request.descricao());
        categoria.setOrdem(request.ordem());
        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    /** RN06: exclusao logica (soft delete). */
    @Transactional
    public void desativar(Long id) {
        Categoria categoria = buscar(id);
        categoria.setStatus(StatusGeral.INATIVO);
        categoriaRepository.save(categoria);
    }

    /** Buscar entidade — usado por outros services. */
    public Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
    }
}
