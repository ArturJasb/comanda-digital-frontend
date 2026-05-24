package com.unasp.comandadigital.dto.prato;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record FichaTecnicaRequest(
        @Min(value = 1, message = "Rendimento deve ser no minimo 1")
        int rendimento,

        String modoPreparo,

        @NotEmpty(message = "Ficha tecnica deve ter pelo menos 1 ingrediente")
        @Valid
        List<FichaTecnicaItemRequest> itens
) {}
