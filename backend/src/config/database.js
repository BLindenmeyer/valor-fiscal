import { Sequelize } from "sequelize";
import path from "path";
import { ClienteModel } from "../models/Cliente.js";

const dbPath = path.resolve(process.cwd(), "database", "clientes.sqlite"); // Caminho para o .sqlite

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false, // Mantém o terminal limpo
});

const Cliente = ClienteModel(sequelize);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Conexão com o SQLite estabelecida com sucesso.");

        await sequelize.sync({ alter: true });
        console.log("Estrutura do modelo sincronizada.");
    } catch (error) {
        console.error("Falha na conexão com o banco de dados:", error);
        process.exit(1);
    }
}

export { sequelize, connectDB, Cliente };
