import { clientesRepository } from "../repositories/clientes-repository.js";

async function list() {
    const clientes = await clientesRepository.list();
    return clientes.map(c => c.toJSON()); // Trata o retorno do sequelize para um json limpo
}

async function getId(id) {
    const cliente = await clientesRepository.getId(id);
    if (!cliente) {
        const err = new Error(`ID: ${id} não encontrado.`);
        err.status = 404;
        throw err;
    }
    return cliente.toJSON();
}

async function getClienteData(clienteData) {
  return clientesRepository.getClienteData(clienteData);
}

async function insert(cliente) {
    const foundCLiente = await clientesRepository.getCpfCnpj(cliente.cpf, cliente.cnpj);
    if (foundCLiente) {
        let msg;
        if (foundCLiente.cpf === cliente.cpf) {
            msg = "CPF já cadastrado em outro cliente.";
        } else if (foundCLiente.cnpj === cliente.cnpj) {
            msg = "CNPJ já cadastrado em outro cliente.";
        }
        const err = new Error(msg);
        err.status = 409;
        throw err;
    }
    const newCliente = await clientesRepository.insert(cliente);
    return newCliente.toJSON();
}

async function update(id, cliente) {
    if (cliente == {}) return
    if (cliente.cpf || cliente.cnpj) {
        const foundCliente = await clientesRepository.getCpfCnpj(cliente.cpf, cliente.cnpj);
        if (foundCliente) {
            if (foundCliente.id !== parseInt(id)) {
                let msg;
                if (foundCliente.cpf === cliente.cpf) {
                    msg = "CPF já cadastrado em outro cliente."
                } else if (foundCliente.cnpj === cliente.cnpj) {
                    msg = "CNPJ já cadastrado em outro cliente."
                }
                const err = new Error(msg);
                err.status = 409;
                throw err;
            }
        }
    }
    const updatedCliente = await clientesRepository.update(id, cliente);
    if (!updatedCliente) {
        const err = new Error("Cliente não encontrado.")
        err.status = 404;
        throw err;
    }
    return updatedCliente.toJSON();
}

async function remove(id) {
    const removedCliente = await clientesRepository.remove(id);
    if (!removedCliente) {
        const err = new Error("Cliente não encontrado.");
        err.status = 404;
        throw err;
    }
    const completeName = removedCliente.nome_completo;
    const splitedName = completeName.split(" "); // Separa onde tiver espaço (" ")
    const firstName = splitedName[0];
    const lastName = splitedName[splitedName.length - 1]; // Pega o último elemento da lista
    return {
        msg: `Cliente ${firstName} ${lastName} excluído com sucesso.`, // Mostra o nome do cliente excluído
    };
}

export const clientesService = {
    list,
    getId,
    getClienteData,
    insert,
    update,
    remove,
};
