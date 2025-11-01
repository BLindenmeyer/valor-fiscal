// Dados mockados apenas para demonstração
const username = "admin";
const password = "admin";

async function login(usuario, senha) {
    if (usuario !== username || senha !== password) {
        const error = new Error("Usuário ou senha incorretos.");
        error.status = 401;
        throw error;
    }
    return {
        message: "Login realizado com sucesso.",
        isAuthenticated: true,
        token: "token", // Simula a geração de um token
    };
}

export const authService = { login }