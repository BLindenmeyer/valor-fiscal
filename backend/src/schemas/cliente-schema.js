import { z } from 'zod';
import { validarCPF, validarCNPJ } from "../utils/validator.js";

const nomeRegex = /^[A-Za-záàâãéèêíïóôõöúüç\s\.\-]+$/; // Permite apenas o que está dentro de '^[...]' (letras, espaços, pontos e acentos)
const digitRegex = /^\d+$/; // Permite apenas dígitos
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; // Regex simples/moderado que cobre a maioria das entradas inválidas

export const ClienteSchema = z.object({
    nome_completo: z.string({
        error: () => "O campo 'Nome' é obrigatório.",
    })
        .min(5, "Por favor, digite o Nome Completo.")
        .refine(v => v.trim().split(" ").filter(Boolean).length > 1,  // Garante que o campo 'Nome' tenha nome e sobrenome
        "Por favor, digite o Nome Completo.")
        .regex(nomeRegex, "Não é permitido caracteres especiais.")
        .max(255, "O campo 'Nome' não deve exceder 255 caracteres.")
        .trim(), // Remove espaços desnecessários no início e no final da string
    
    cpf: z.string({
        error: () => "O campo 'CPF' é obrigatório.",
    })
        .length(11, "CPF inválido.")
        .regex(digitRegex, "O campo 'CPF' deve conter apenas números.")
        .refine(validarCPF, "CPF inválido. Verifique os dígitos verificadores.")
        .trim(),
    
    cnpj: z.string()
        .length(14, "CNPJ inválido.")
        .regex(digitRegex, "O campo 'CNPJ' deve conter apenas números.")
        .refine(validarCNPJ, "CNPJ inválido. Verifique os dígitos verificadores.")
        .or(z.literal("")) // Permite que seja string vazia
        .transform(e => e === "" ? null : e) // Transforma "" em null
        .nullish(), // Aceita null e undefined
        
    email: z.string()
        .max(100, "O campo 'Email' não deve exceder 100 caracteres.")
        .regex(emailRegex, "Email inválido.")
        .or(z.literal(""))
        .transform(e => e === "" ? null : e)
        .nullish(),

    telefone: z.string()
        .length(11, "O campo 'Telefone' deve conter o DDD + 9 dígitos (ex: 11987654321).")
        .regex(digitRegex, "O campo 'Telefone' deve conter apenas números.")
        .or(z.literal(""))
        .transform(e => e === "" ? null : e)
        .nullish(),
});
