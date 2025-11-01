import { ZodError } from "zod";
import { authService } from "../services/auth-service.js";
import { LoginSchema } from "../schemas/auth-schema.js";

async function login(req, res) {
    try {
        const loginData = LoginSchema.parse(req.body);
        const loginResult = await authService.login(loginData.username, loginData.password);
        res.status(200).json(loginResult);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                detalhes: error.errors.map((err) => ({
                    campo: err.path.join("."),
                    mensagem: err.message,
                })),
            })
        }
        res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

export const authController = { login };
