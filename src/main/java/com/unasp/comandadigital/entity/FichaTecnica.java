package com.unasp.comandadigital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ficha_tecnica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FichaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prato_id", nullable = false, unique = true)
    private Prato prato;

    @Column(nullable = false)
    @Builder.Default
    private Integer rendimento = 1;

    @Column(name = "modo_preparo", columnDefinition = "TEXT")
    private String modoPreparo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "fichaTecnica", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<FichaTecnicaItem> itens = new ArrayList<>();
}
