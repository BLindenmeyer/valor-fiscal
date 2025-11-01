const BASE_URL = "http://localhost:3000";

let token = localStorage.getItem("token") || null;

export function setToken(t) {
    token = t;
    if (t) localStorage.setItem("token", t);
}

export function clearToken() {
    token = null;
    localStorage.removeItem("token");
}

export async function api(path, { method = "GET", body } = {}) {
    const url = `${BASE_URL}${path}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const ct = response.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await response.json() : null;

        if (!response.ok) {
            if (data?.error) {
                throw new Error(data.error);
            }

            if (Array.isArray(data?.detalhes) && data.detalhes.length > 0) {
                const errosUnicos = [];
                const camposVistos = new Set();

                for (const detalhe of data.detalhes) {
                    const chave = `${detalhe.campo}:${detalhe.mensagem}`;
                    if (!camposVistos.has(chave)) {
                        camposVistos.add(chave);
                        errosUnicos.push(detalhe);
                    }
                }

                const nomesCampos = {
                    nome_completo: "Nome Completo",
                    cpf: "CPF",
                    cnpj: "CNPJ",
                    email: "Email",
                    telefone: "Telefone",
                };

                if (errosUnicos.length === 1) {
                    const erro = errosUnicos[0];
                    const campoNome = nomesCampos[erro.campo] || erro.campo;
                    throw new Error(`${campoNome}: ${erro.mensagem}`);
                }

                const mensagens = errosUnicos.map((erro) => {
                    const campoNome = nomesCampos[erro.campo] || erro.campo;
                    return `• ${campoNome}: ${erro.mensagem}`;
                });

                throw new Error(
                    `Por favor, corrija os seguintes erros:\n${mensagens.join("\n")}`
                );
            }
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        return data;
    } catch (error) {
        const msg = (error?.message || "").toLowerCase();
        if (error instanceof TypeError && (msg.includes("failed") || msg.includes("fetch") || msg.includes("network"))) {
            throw new Error(
                "Não foi possível conectar ao backend.\n" +
                "A API deve estar rodando em http://localhost:3000.\n" +
                "Execute: > npm start (na pasta do backend)."
            );
        }
        throw error;
    }
}
