package com.unasp.comandadigital.service;

import com.unasp.comandadigital.config.CnpjValidator;
import com.unasp.comandadigital.dto.fornecedor.FornecedorProdutoRequest;
import com.unasp.comandadigital.dto.fornecedor.FornecedorProdutoResponse;
import com.unasp.comandadigital.dto.fornecedor.FornecedorRequest;
import com.unasp.comandadigital.dto.fornecedor.FornecedorResponse;
import com.unasp.comandadigital.entity.Fornecedor;
import com.unasp.comandadigital.entity.FornecedorProduto;
import com.unasp.comandadigital.entity.Ingrediente;
import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.exception.BusinessException;
import com.unasp.comandadigital.exception.ConflictException;
import com.unasp.comandadigital.exception.ResourceNotFoundException;
import com.unasp.comandadigital.repository.FornecedorProdutoRepository;
import com.unasp.comandadigital.repository.FornecedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final FornecedorProdutoRepository fornecedorProdutoRepository;
    private final IngredienteService ingredienteService;

    public Page<FornecedorResponse> listar(Pageable pageable) {
        return fornecedorRepository.findAll(pageable).map(FornecedorResponse::from);
    }

    public FornecedorResponse buscarPorId(Long id) {
        return FornecedorResponse.from(buscar(id));
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        // RN07: validar CNPJ
        if (!CnpjValidator.isValid(request.cnpj())) {
            throw new BusinessException("CNPJ invalido: " + request.cnpj());
        }

        String cnpjFormatado = CnpjValidator.format(request.cnpj());

        if (fornecedorRepository.existsByCnpj(cnpjFormatado)) {
            throw new ConflictException("CNPJ ja cadastrado: " + cnpjFormatado);
        }

        Fornecedor fornecedor = Fornecedor.builder()
                .razaoSocial(request.razaoSocial())
                .cnpj(cnpjFormatado)
                .telefone(request.telefone())
                .email(request.email())
                .status(StatusGeral.ATIVO)
                .build();

        return FornecedorResponse.from(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse atualizar(Long id, FornecedorRequest request) {
        Fornecedor fornecedor = buscar(id);

        if (!CnpjValidator.isValid(request.cnpj())) {
            throw new BusinessException("CNPJ invalido: " + request.cnpj());
        }

        String cnpjFormatado = CnpjValidator.format(request.cnpj());

        if (!fornecedor.getCnpj().equals(cnpjFormatado)
                && fornecedorRepository.existsByCnpj(cnpjFormatado)) {
            throw new ConflictException("CNPJ ja cadastrado: " + cnpjFormatado);
        }

        fornecedor.setRazaoSocial(request.razaoSocial());
        fornecedor.setCnpj(cnpjFormatado);
        fornecedor.setTelefone(request.telefone());
        fornecedor.setEmail(request.email());

        return FornecedorResponse.from(fornecedorRepository.save(fornecedor));
    }

    /** RN06: exclusao logica. */
    @Transactional
    public void desativar(Long id) {
        Fornecedor fornecedor = buscar(id);
        fornecedor.setStatus(StatusGeral.INATIVO);
        fornecedorRepository.save(fornecedor);
    }

    // ---------------- Catalogo (RF-22) ----------------

    @Transactional
    public FornecedorProdutoResponse adicionarProduto(Long fornecedorId, FornecedorProdutoRequest request) {
        Fornecedor fornecedor = buscar(fornecedorId);
        Ingrediente ingrediente = ingredienteService.buscar(request.ingredienteId());

        fornecedorProdutoRepository
                .findByFornecedorIdAndIngredienteId(fornecedorId, request.ingredienteId())
                .ifPresent(fp -> {
                    throw new ConflictException("Ingrediente ja vinculado a este fornecedor");
                });

        FornecedorProduto fp = FornecedorProduto.builder()
                .fornecedor(fornecedor)
                .ingrediente(ingrediente)
                .preco(request.preco())
                .unidadeVenda(request.unidadeVenda())
                .build();

        return FornecedorProdutoResponse.from(fornecedorProdutoRepository.save(fp));
    }

    @Transactional
    public FornecedorProdutoResponse atualizarProduto(Long fornecedorId, Long produtoId,
                                                     FornecedorProdutoRequest request) {
        FornecedorProduto fp = fornecedorProdutoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto do fornecedor", produtoId));

        if (!fp.getFornecedor().getId().equals(fornecedorId)) {
            throw new BusinessException("Produto nao pertence a este fornecedor");
        }

        fp.setPreco(request.preco());
        fp.setUnidadeVenda(request.unidadeVenda());

        return FornecedorProdutoResponse.from(fornecedorProdutoRepository.save(fp));
    }

    @Transactional
    public void removerProduto(Long fornecedorId, Long produtoId) {
        FornecedorProduto fp = fornecedorProdutoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto do fornecedor", produtoId));

        if (!fp.getFornecedor().getId().equals(fornecedorId)) {
            throw new BusinessException("Produto nao pertence a este fornecedor");
        }

        fornecedorProdutoRepository.delete(fp);
    }

    public List<FornecedorProdutoResponse> listarProdutos(Long fornecedorId) {
        buscar(fornecedorId); // valida existencia
        return fornecedorProdutoRepository.findByFornecedorId(fornecedorId)
                .stream().map(FornecedorProdutoResponse::from).toList();
    }

    /** RF-23: cotacao comparativa. */
    public List<FornecedorProdutoResponse> cotacao(Long ingredienteId) {
        ingredienteService.buscar(ingredienteId); // valida existencia
        return fornecedorProdutoRepository.findCotacaoPorIngrediente(ingredienteId)
                .stream().map(FornecedorProdutoResponse::from).toList();
    }

    public Fornecedor buscar(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor", id));
    }
}
