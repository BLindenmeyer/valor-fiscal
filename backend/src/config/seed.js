import { connectDB, Cliente } from "../config/database.js";

await connectDB();

await Cliente.bulkCreate(
    [
        {
            nome_completo: "Alice Vieira dos Santos",
            cpf: "12345678909",
            email: "alice.santos@exemplo.com",
            telefone: "11987654321",
        },
        {
            nome_completo: "Bruno Henrique Costa",
            cpf: "98765432100",
            email: "bruno.costa@tech.net",
            telefone: null,
        },
        {
            nome_completo: "Carla Regina de Jesus",
            cpf: "11122233396",
            email: null,
            telefone: "31987654323",
        },
        {
            nome_completo: "Daniel Almeida Prado",
            cpf: "22233344405",
            email: "daniel.prado@company.org",
            telefone: null,
        },
        {
            nome_completo: "Elisa Gomes Ferreira",
            cpf: "13579135759",
            email: null,
            telefone: "51987654325",
        },
        {
            nome_completo: "Fábio Souza Lima",
            cpf: "24681357928",
            email: "fabio@email.com.br",
            telefone: "11999999999",
        },
        {
            nome_completo: "Gama Consultoria EPP",
            cpf: "31415926590",
            cnpj: "50000000000089",
            email: "gerencia@gama.net",
            telefone: "31303010030",
        },
        {
            nome_completo: "Delta Soluções ME",
            cpf: "84012345656",
            cnpj: "50000000000160",
            email: null,
            telefone: "41303010040",
        },
        {
            nome_completo: "Omega Logística",
            cpf: "32100000004",
            cnpj: "11444777000161",
            email: "rh@omega.log",
            telefone: null,
        },
        {
            nome_completo: "Vanessa Souza",
            cpf: "32100000187",
            email: null,
            telefone: null,
        },
    ],
    { validate: false, ignoreDuplicates: true }
);

console.log("Seed concluído.");
process.exit(0);
