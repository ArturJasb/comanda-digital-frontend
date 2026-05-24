package com.unasp.comandadigital.config;

/**
 * Validacao de CNPJ pelo algoritmo oficial da Receita Federal (RN07).
 */
public final class CnpjValidator {

    private static final int[] WEIGHTS_1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] WEIGHTS_2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private CnpjValidator() {
        // utilitario
    }

    public static boolean isValid(String cnpj) {
        if (cnpj == null) {
            return false;
        }

        String cleaned = cnpj.replaceAll("[^0-9]", "");

        if (cleaned.length() != 14) {
            return false;
        }

        // Rejeita CNPJs com todos os digitos iguais (000..., 111..., etc.)
        if (cleaned.chars().distinct().count() == 1) {
            return false;
        }

        int d1 = calculateDigit(cleaned, WEIGHTS_1, 12);
        if (d1 != Character.getNumericValue(cleaned.charAt(12))) {
            return false;
        }

        int d2 = calculateDigit(cleaned, WEIGHTS_2, 13);
        return d2 == Character.getNumericValue(cleaned.charAt(13));
    }

    private static int calculateDigit(String cnpj, int[] weights, int length) {
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += Character.getNumericValue(cnpj.charAt(i)) * weights[i];
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }

    /** Formata como XX.XXX.XXX/XXXX-XX. */
    public static String format(String cnpj) {
        if (cnpj == null) {
            return null;
        }
        String c = cnpj.replaceAll("[^0-9]", "");
        if (c.length() != 14) {
            return cnpj;
        }
        return c.substring(0, 2) + "." + c.substring(2, 5) + "." +
               c.substring(5, 8) + "/" + c.substring(8, 12) + "-" + c.substring(12);
    }
}
