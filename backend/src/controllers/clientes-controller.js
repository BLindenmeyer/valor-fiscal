import { ZodError } from "zod";
import { clientesService } from "../services/clientes-service.js";
import { ClienteSchema } from "../schemas/cliente-schema.js";

async function list(req, res) {
    try {
        const clientes = await clientesService.list();
        res.status(200).json(clientes);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

async function getId(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido. Deve ser um número." });
        }
        const cliente = await clientesService.getId(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        res.status(200).json(cliente);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

async function getClienteData(req, res) {
    try {
        const clienteData = String(req.query.q || "").trim();
        if (!clienteData) return res.status(200).json([]);
        const clientes = await clientesService.getClienteData(clienteData);
        return res.status(200).json(clientes);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

async function insert(req, res) {
    try {
        const validCliente = ClienteSchema.parse(req.body);
        const cliente = await clientesService.insert(validCliente);
        res.status(201).json(cliente);
    } catch (error) {
        if (error instanceof ZodError) {
            // Lógica para tratar o ZodError
            return res.status(400).json({
                detalhes: error.issues.map((err) => ({
                    campo: err.path.join("."),
                    mensagem: err.message,
                })),
            });
        }
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

async function update(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido. Deve ser um número." });
        }
        if (!Object.keys(req.body).length) { // Se a body vier vazia '{}' retorna o objeto inteiro
            const cliente = await clientesService.getId(id);
            return res.status(200).json(cliente);
        }
        const validCliente = ClienteSchema.partial().parse(req.body);
        const cliente = await clientesService.update(id, validCliente);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        res.status(200).json(cliente);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                detalhes: error.issues.map((err) => ({
                    campo: err.path.join("."),
                    mensagem: err.message,
                })),
            });
        }
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

async function remove(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido. Deve ser um número." });
        }
        const msg = await clientesService.remove(id);
        if (!msg) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        res.status(200).json(msg);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno do servidor." });
    }
}

export const clientesController = {
    list,
    getId,
    getClienteData,
    insert,
    update,
    remove,
};
