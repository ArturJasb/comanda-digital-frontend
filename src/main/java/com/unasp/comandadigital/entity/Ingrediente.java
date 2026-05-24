package com.unasp.comandadigital.entity;

import com.unasp.comandadigital.entity.enums.StatusGeral;
import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingrediente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingrediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(unique = true, length = 50)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_padrao", nullable = false, length = 5)
    private UnidadeMedida unidadePadrao;

    @Column(name = "estoque_minimo", nullable = false, precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal estoqueMinimo = BigDecimal.ZERO;

    @Column(name = "custo_unitario", nullable = false, precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal custoUnitario = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private StatusGeral status = StatusGeral.ATIVO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
