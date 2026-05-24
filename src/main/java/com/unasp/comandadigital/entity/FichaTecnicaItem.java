package com.unasp.comandadigital.entity;

import com.unasp.comandadigital.entity.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ficha_tecnica_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FichaTecnicaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ficha_tecnica_id", nullable = false)
    private FichaTecnica fichaTecnica;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal quantidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private UnidadeMedida unidade;

    @Column(name = "fator_correcao", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal fatorCorrecao = BigDecimal.ONE;
}
