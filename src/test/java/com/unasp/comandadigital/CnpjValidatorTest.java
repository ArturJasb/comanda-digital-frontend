package com.unasp.comandadigital;

import com.unasp.comandadigital.config.CnpjValidator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes leves que nao requerem subir o contexto Spring (logo, nao precisam de MySQL).
 * Validam o algoritmo critico de CNPJ (RN07).
 */
class CnpjValidatorTest {

    @Test
    void cnpjValidoComMascara() {
        assertTrue(CnpjValidator.isValid("11.222.333/0001-81"));
    }

    @Test
    void cnpjValidoSemMascara() {
        assertTrue(CnpjValidator.isValid("11222333000181"));
    }

    @Test
    void cnpjInvalidoDigitosErrados() {
        assertFalse(CnpjValidator.isValid("11.222.333/0001-00"));
    }

    @Test
    void cnpjInvalidoTodosIguais() {
        assertFalse(CnpjValidator.isValid("00.000.000/0000-00"));
        assertFalse(CnpjValidator.isValid("11.111.111/1111-11"));
    }

    @Test
    void cnpjInvalidoTamanhoErrado() {
        assertFalse(CnpjValidator.isValid("123"));
        assertFalse(CnpjValidator.isValid(""));
        assertFalse(CnpjValidator.isValid(null));
    }

    @Test
    void formatacaoFunciona() {
        String formatted = CnpjValidator.format("11222333000181");
        assertTrue(formatted.equals("11.222.333/0001-81"));
    }
}
