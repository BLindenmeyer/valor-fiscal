import { api } from "./api.js";

export const ClientesAPI = {
	list() {
		return api("/api/clientes");
	},
	search(clienteData) {
		return api(`/api/clientes/search?q=${encodeURIComponent(clienteData)}`);
	},
	get(id) {
		return api(`/api/clientes/${id}`);
	},
	create(cliente) {
		return api("/api/clientes", { method: "POST", body: cliente });
	},
	update(id, cliente) {
		return api(`/api/clientes/${id}`, { method: "PUT", body: cliente });
	},
	remove(id) {
		return api(`/api/clientes/${id}`, { method: "DELETE" });
	},
};

