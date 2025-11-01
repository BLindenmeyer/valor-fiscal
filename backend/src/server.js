import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/database.js";
import clientesRoutes from "./routes/clientes-route.js";
import authRoutes from "./routes/auth-route.js";
import path from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Esse bloco serve para criar um servidor estático Express para não ter problemas de fetch (no desenvolvimento eu estava usando Live Server)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../../frontend");

app.use(express.static(publicDir));

app.get("/", (req, res) => {
    // res.send("API Valor Fiscal está ONLINE.");
    res.sendFile(path.join(publicDir, "login.html"));
});

// router.use(verifyToken); // Dados mockados

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);

async function startServer() {
    await connectDB(); // Conexão com o SQLite

    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

startServer();
