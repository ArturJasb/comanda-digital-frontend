package com.unasp.comandadigital.entity;

import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "fornecedor_produto",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_fornecedor_ingrediente",
        columnNames = {"fornecedor_id", "ingrediente_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FornecedorProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_venda", nullable = false, length = 5)
    private UnidadeMedida unidadeVenda;
}
