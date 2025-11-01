import request from "supertest";
import express from "express";
import { connectDB, Cliente } from "../config/database.js";
import clientesRoutes from "../routes/clientes-route.js";
import { clientesRepository } from "../repositories/clientes-repository.js";

const app = express();
app.use(express.json());
app.use("/api/clientes", clientesRoutes);

// SETUP
beforeAll(async () => {
    await connectDB();
});

beforeEach(async () => {
    await Cliente.destroy({ truncate: true, cascade: true }); // Limpeza do banco
});

// VARIAVEIS PARA TESTES
const CLIENTE_VALIDO = {
    nome_completo: "Pedro da Silva",
    cpf: "11144477735",
};

const CLIENTE_VALIDO_VAZIO = {
    nome_completo: "Maria de Lurdes Souza",
    cpf: "12345678909",
    cnpj: "",
    email: "",
    telefone: ""
};

const CLIENTE_CPF_DUPLICADO = {
    nome_completo: "Pedro Silva",
    cpf: "11144477735",
    cnpj: "11222333000181",
};

const CLIENTE_CNPJ = {
    nome_completo: "Empresa Teste",
    cpf: "98765432100",
    cnpj: "12345678000195",
};

const CLIENTE_CNPJ_DUPLICADO = {
    nome_completo: "Outra Empresa",
    cpf: "11144477735",
    cnpj: "12345678000195",
};

const CLIENTE_ESPAÇOS = {
    nome_completo: "  Ana Clara  ",
    cpf: "11144477735",
};

const CLIENTE_SEM_NOME = {
    cpf: "12345678909",
};

const CLIENTE_SEM_CPF = {
    nome_completo: "João da Silva",
};

const CLIENTE_PRIMEIRO_NOME = {
    nome_completo: "Anastacia",
    cpf: "12345678909",
};

const CLIENTE_CARACTERES_ESPECIAIS = {
    nome_completo: "Jo@o Paulo",
    cpf: "11144477735",
};

const CLIENTE_256 = {
    nome_completo: "A".repeat(250) + " Silva",
    cpf: "11144477735",
};

const CLIENTE_CPF_INVALIDO = {
    nome_completo: "Pedro Pedroso",
    cpf: "9574681242",
};

const CLIENTE_CPF_LETRAS = {
    nome_completo: "Pedro Pedroso",
    cpf: "5438letras",
};

const CLIENTE_CNPJ_INVALIDO = {
    nome_completo: "Pedro Pedroso",
    cpf: "95746812445",
    cnpj: "9574681244512",
};

const CLIENTE_CNPJ_LETRAS = {
    nome_completo: "Pedro Pedroso",
    cpf: "95746812445",
    cnpj: "124letras",
};

const CLIENTE_EMAIL_101 = {
    nome_completo: "Pedro Pedroso",
    cpf: "11144477735",
    email: "e".repeat(91) + "@email.com",
};

const CLIENTE_EMAIL_INVALIDO = {
    nome_completo: "Pedro Pedroso",
    cpf: "95746812421",
    email: "email@email",
};

const CLIENTE_TELEFONE_INVALIDO = {
    nome_completo: "Pedro Pedroso",
    cpf: "11144477735",
    telefone: "5191234567",
};

const CLIENTE_TELEFONE_LETRAS = {
    nome_completo: "Pedro Pedroso",
    cpf: "11144477735",
    telefone: "519123letra",
};

// TESTES DE INTEGRAÇÃO
describe("GET /api/clientes/ - list()", () => {
    test("Status: 200 - Deve retornar um array vazio quando não há clientes", async () => {
        const response = await request(app).get("/api/clientes");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("Status: 200 - Deve retornar a lista de clientes", async () => {
        await Cliente.create(CLIENTE_VALIDO);
        const response = await request(app).get("/api/clientes");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    });
});

describe("GET /api/clientes/:id - getId()", () => {
    test("Status: 404 - Deve retornar uma mensagem de erro dizendo que o ID não foi encontrado.", async () => {
        const id = 9999;
        const response = await request(app).get(`/api/clientes/${id}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", `ID: ${id} não encontrado.`);
    });

    test("Status: 200 - Deve retornar o cliente pelo ID.", async () => {
        const cliente = await Cliente.create(CLIENTE_VALIDO);
        const response = await request(app).get(`/api/clientes/${cliente.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(cliente.id);
        expect(response.body.nome_completo).toBe(cliente.nome_completo);
    });
});

describe("POST /api/clientes/ - getCpfCnpj()", () => {
    test("Status: 409 - Deve retornar uma mensagem de erro dizendo que o CPF já existe.", async () => {
        await request(app).post('/api/clientes').send(CLIENTE_VALIDO);
        const response = await request(app).post('/api/clientes').send(CLIENTE_CPF_DUPLICADO);
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "CPF já cadastrado em outro cliente.");
    });
    
    test("Status: 409 - Deve retornar uma mensagem de erro dizendo que o CNPJ já existe.", async () => {
        await request(app).post('/api/clientes').send(CLIENTE_CNPJ);
        const response = await request(app).post('/api/clientes').send(CLIENTE_CNPJ_DUPLICADO);
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "CNPJ já cadastrado em outro cliente.");
    });

    test("Status: 201 - Deve retornar o cliente inserido.", async () => {
        await request(app).post('/api/clientes').send(CLIENTE_VALIDO);
        const response = await request(app).post('/api/clientes').send(CLIENTE_CNPJ);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.cpf).toBe(CLIENTE_CNPJ.cpf);
    });
});

describe("GET /api/clientes/ - getClienteData()", () => {
    beforeEach(async () => {
        await Cliente.bulkCreate([
            { nome_completo: "Pedro da Silva", cpf: "32100000004" },
            { nome_completo: "Pedro Paulo",   cpf: "32100000187", cnpj: "50000000000089" },
            { nome_completo: "Ana Pedroso",   cpf: "98765432100", cnpj: "50000000000160" },
        ]);
    });

    test("Deve retornar todos os clientes pelo nome (LIKE %nome%).", async () => {
        const response = await clientesRepository.getClienteData("Pedro");
        expect(response).toHaveLength(3);
        expect(response.map(c => c.nome_completo)).toEqual(
            expect.arrayContaining(["Ana Pedroso", "Pedro da Silva", "Pedro Paulo"])
        );
    });
    
    test("Deve retornar todos os clientes pelo CPF (LIKE cpf%).", async () => {
        const response = await clientesRepository.getClienteData("321");
        expect(response).toHaveLength(2);
        expect(response.map(c => c.nome_completo)).toEqual(
            expect.arrayContaining(["Pedro da Silva", "Pedro Paulo"])
        );
    });
    
    test("Deve retornar todos os clientes pelo CNPJ (LIKE cnpj%).", async () => {
        const response = await clientesRepository.getClienteData("5000");
        expect(response).toHaveLength(2);
        expect(response.map(c => c.nome_completo)).toEqual(
            expect.arrayContaining(["Ana Pedroso", "Pedro Paulo"])
        );
    });
});

describe("POST /api/clientes/ - insert()", () => {
    test("Status: 201 - Deve inserir um cliente com nome e cpf.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_VALIDO);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.nome_completo).toBe(CLIENTE_VALIDO.nome_completo);
        expect(response.body.cpf).toBe(CLIENTE_VALIDO.cpf);
    });

    test("Status: 201 - Deve aceitar strings vazias e converter para null.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_VALIDO_VAZIO);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.cnpj).toBeNull();
        expect(response.body.email).toBeNull();
        expect(response.body.telefone).toBeNull();
    });

    test("Status: 201 - Deve remover espaços extras.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_ESPAÇOS);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.nome_completo).toBe("Ana Clara");
        expect(response.body.cpf).toBe("11144477735");
    });

    test("Status: 400 - O campo 'Nome' é obrigatório.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_SEM_NOME);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "nome_completo",
                    mensagem: "O campo 'Nome' é obrigatório.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'CPF' é obrigatório.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_SEM_CPF);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "O campo 'CPF' é obrigatório.",
                }),
            ])
        );
    });

    test("Status: 400 - Por favor, digite o Nome Completo.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_PRIMEIRO_NOME);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "nome_completo",
                    mensagem: "Por favor, digite o Nome Completo.",
                }),
            ])
        );
    });

    test("Status: 400 - Não é permitido caracteres especiais.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_CARACTERES_ESPECIAIS);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "nome_completo",
                    mensagem: "Não é permitido caracteres especiais.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'Nome' não deve exceder 255 caracteres.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_256);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "nome_completo",
                    mensagem: "O campo 'Nome' não deve exceder 255 caracteres.",
                }),
            ])
        );
    });

    test("Status: 400 - CPF inválido.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_CPF_INVALIDO);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "CPF inválido.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'CPF' deve conter apenas números.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_CPF_LETRAS);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "O campo 'CPF' deve conter apenas números.",
                }),
            ])
        );
    });

    test("Status: 400 - CPF com dígito verificador inválido.", async () => {
        const response = await request(app).post("/api/clientes").send({ nome_completo: "João Silva", cpf: "11144477736" });
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "CPF inválido. Verifique os dígitos verificadores.",
                }),
            ])
        );
    });

    test("Status: 400 - CNPJ inválido.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_CNPJ_INVALIDO);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cnpj",
                    mensagem: "CNPJ inválido.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'CNPJ' deve conter apenas números.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_CNPJ_LETRAS);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cnpj",
                    mensagem: "O campo 'CNPJ' deve conter apenas números.",
                }),
            ])
        );
    });

    test("Status: 400 - CNPJ com dígito verificador inválido.", async () => {
        const response = await request(app).post("/api/clientes").send({ nome_completo: "Empresa Teste", cpf: "11144477735", cnpj: "12345678000190" });
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cnpj",
                    mensagem: "CNPJ inválido. Verifique os dígitos verificadores.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'Email' não deve exceder 100 caracteres.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_EMAIL_101);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "email",
                    mensagem: "O campo 'Email' não deve exceder 100 caracteres.",
                }),
            ])
        );
    });

    test("Status: 400 - Email inválido.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_EMAIL_INVALIDO);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "email",
                    mensagem: "Email inválido.",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'Telefone' deve conter o DDD + 9 dígitos (ex: 11987654321).", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_TELEFONE_INVALIDO);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "telefone",
                    mensagem: "O campo 'Telefone' deve conter o DDD + 9 dígitos (ex: 11987654321).",
                }),
            ])
        );
    });

    test("Status: 400 - O campo 'Telefone' deve conter apenas números.", async () => {
        const response = await request(app).post("/api/clientes").send(CLIENTE_TELEFONE_LETRAS);
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "telefone",
                    mensagem: "O campo 'Telefone' deve conter apenas números.",
                }),
            ])
        );
    });
});

describe("PUT /api/clientes/:id - update()", () => {
    let cliente1, cliente2;
    beforeEach(async () => {
        await Cliente.destroy({ truncate: true, cascade: true });
        cliente1 = await Cliente.create({ nome_completo: "Pedro Silva", cpf: "11144477735" });
        cliente2 = await Cliente.create({ nome_completo: "Maria Souza", cpf: "12345678909", cnpj: "12345678000195" });
    });

    test("Status: 200 - Deve atualizar apenas um campo e retornar o objeto atualizado.", async () => {
        const response = await request(app).put(`/api/clientes/${cliente1.id}`).send({ nome_completo: "Pedro da Silva" });
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(cliente1.id);
        expect(response.body.nome_completo).toBe("Pedro da Silva");
        expect(response.body.cpf).toBe(cliente1.cpf);
    });

    test("Status: 200 - Deve atualizar os campos vazios para null.", async () => {
        const response = await request(app).put(`/api/clientes/${cliente2.id}`).send({ cnpj: "", email: "", telefone: "" });
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(cliente2.id);
        expect(response.body.nome_completo).toBe(cliente2.nome_completo);
        expect(response.body.cpf).toBe(cliente2.cpf);
        expect(response.body.cnpj).toBeNull();
        expect(response.body.email).toBeNull();
        expect(response.body.telefone).toBeNull();
    });

    test("Status: 404 - Tentativa de atualizar um ID inexistente.", async () => {
        const id = 9999;
        const response = await request(app).put(`/api/clientes/${id}`).send({ nome_completo: "Qualquer Nome" });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "Cliente não encontrado.");
    });
    
    test("Status: 409 - Tentativa de atualizar com CPF existente.", async () => {
        const response = await request(app).put(`/api/clientes/${cliente1.id}`).send({ cpf: cliente2.cpf });
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "CPF já cadastrado em outro cliente.");
    });
    
    test("Status: 409 - Tentativa de atualizar com CNPJ existente.", async () => {
        await request(app).put(`/api/clientes/${cliente1.id}`).send({ cnpj: "11222333000181" });
        const response = await request(app).put(`/api/clientes/${cliente2.id}`).send({ cnpj: "11222333000181" });
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "CNPJ já cadastrado em outro cliente.");
    });
    
    test("Status: 400 - Tentativa de atualizar com Nome inválido.", async () => {
        const response = await request(app).put(`/api/clientes/${cliente1.id}`).send({ nome_completo: "Pedro" });
        expect(response.statusCode).toBe(400);
        expect(response.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "nome_completo",
                    mensagem: "Por favor, digite o Nome Completo.",
                }),
            ])
        );
    });
    
    test("Status: 400 - Tentativa de atualizar com CPF inválido.", async () => {
        const response1 = await request(app).put(`/api/clientes/${cliente1.id}`).send({ cpf: "123" });
        const response2 = await request(app).put(`/api/clientes/${cliente1.id}`).send({ cpf: "98732letra" });
        const response3 = await request(app).put(`/api/clientes/${cliente1.id}`).send({ cpf: "11144477736" });
        expect(response1.statusCode).toBe(400);
        expect(response2.statusCode).toBe(400);
        expect(response1.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "CPF inválido.",
                }),
            ])
        );
        expect(response2.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "O campo 'CPF' deve conter apenas números.",
                }),
            ])
        );
        expect(response3.body.detalhes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    campo: "cpf",
                    mensagem: "CPF inválido. Verifique os dígitos verificadores.",
                }),
            ])
        );
    });
    
    test("Status: 200 - Deve manter o registro original quando a body está vazia.", async () => {
        const response = await request(app).put(`/api/clientes/${cliente1.id}`).send({});
        expect(response.statusCode).toBe(200);
        expect(response.body.nome_completo).toBe(cliente1.nome_completo);
        expect(response.body.cpf).toBe(cliente1.cpf);
    });
});

describe("DELETE /api/clientes/:id - remove()", () => {
    test("Status: 404 - Tentativa de remover um ID inexistente", async () => {
        const id = 9999;
        await request(app).post("/api/clientes").send(CLIENTE_VALIDO);
        const response = await request(app).delete(`/api/clientes/${id}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "Cliente não encontrado.");
    });

    test("Status: 200/404 - Deve remover o cliente e falhar na tentativa de remover novamente.", async () => {
        const cliente = await request(app).post("/api/clientes").send(CLIENTE_VALIDO);
        const response = await request(app).delete(`/api/clientes/${cliente.body.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("msg", "Cliente Pedro Silva excluído com sucesso.");

        const fail = await request(app).delete(`/api/clientes/${cliente.body.id}`);
        expect(fail.statusCode).toBe(404);
        expect(fail.body).toHaveProperty("error", "Cliente não encontrado.");
    });
});

// Apaga os registros deixados pelo último teste
afterAll(async () => {
    await Cliente.destroy({ truncate: true, cascade: true });
});