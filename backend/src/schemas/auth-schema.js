import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(1, "O campo 'Usuário' não pode ser vazio."),
    password: z.string().min(1, "O campo 'Senha' não pode ser vazio."),
});