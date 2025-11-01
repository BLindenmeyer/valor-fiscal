import { Cliente, sequelize } from "../config/database.js";

const { Op } = sequelize.Sequelize; // Operador do sequelize para queries complexas (OR / LIKE)

async function list() {
    return await Cliente.findAll();
}

async function getId(id) {
    return await Cliente.findByPk(id);
}

async function getCpfCnpj(cpf, cnpj) { // Impede cpf/cnpj duplicados
    const or = [];
    if (cpf != null)  or.push({ cpf });
    if (cnpj != null) or.push({ cnpj });
    if (!or.length) return null;
    return await Cliente.findOne({ where: {[Op.or]: or} });
}

async function getClienteData(clienteData) { // Permite a busca por nome, cpf ou cnpj (frontend)
    const whereClause = {
        [Op.or]: [
            { nome_completo: {[Op.like]: `%${clienteData}%`} },
            { cpf: {[Op.like]: `${clienteData}%`} },
            { cnpj: {[Op.like]: `${clienteData}%`} },
        ]
    };
    return await Cliente.findAll({ where: whereClause, order: [["nome_completo", "ASC"]] }); // Ordena por nome
}

async function insert(cliente) {
    return await Cliente.create(cliente);
}

async function update(id, cliente) {
    const [rowsUpdated] = await Cliente.update(
        cliente, {
            where: { id: id },
            returning: false,
        }
    );
    if (rowsUpdated === 0) return null;
    const updatedCliente = await Cliente.findByPk(id);
    return updatedCliente;
}

async function remove(id) {
    const cliente = await Cliente.findByPk(id); // Busca o cliente para retorná-lo ao usuário
    if (!cliente) return null;
    await cliente.destroy();
    return cliente.toJSON();
}

export const clientesRepository = {
    list,
    getId,
    getCpfCnpj,
    getClienteData,
    insert,
    update,
    remove,
};
