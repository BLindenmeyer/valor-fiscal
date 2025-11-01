import { ClientesAPI } from "./clientes.js";
import { clearToken } from "./api.js";

if (!localStorage.getItem("token")) {
  	window.location.href = "login.html";
}

const searchInput = document.getElementById("searchInput");
const newBtn = document.getElementById("newBtn");
const emptyNewBtn = document.getElementById("emptyNewBtn");
const logoutBtn = document.getElementById("logoutBtn");
const globalAlert = document.getElementById("globalAlert");
const globalAlertMessage = document.getElementById("globalAlertMessage");
const tbody = document.getElementById("tbody");
const tableContainer = document.getElementById("tableContainer");
const cardsContainer = document.getElementById("cardsContainer");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

const clienteModalEl = document.getElementById("clienteModal");
const clienteModal = new bootstrap.Modal(clienteModalEl);
const clienteForm = document.getElementById("clienteForm");
const clienteModalTit = document.getElementById("clienteModalTitle");
const formAlert = document.getElementById("formAlert");
const formAlertMessage = document.getElementById("formAlertMessage");
const fId = document.getElementById("clienteId");
const fNome = document.getElementById("nome");
const fCpf = document.getElementById("cpf");
const fCnpj = document.getElementById("cnpj");
const fEmail = document.getElementById("email");
const fTel = document.getElementById("telefone");
const saveBtn = document.getElementById("saveBtn");

let clientes = [];
let searchTimeout = null;
let currentQuery = "";
let reqSeq = 0;

function formatCPF(cpf) {
	if (!cpf) return "";
	const cleaned = cpf.replace(/\D/g, "");
	if (cleaned.length !== 11) return cleaned;
	return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCNPJ(cnpj) {
	if (!cnpj) return "";
	const cleaned = cnpj.replace(/\D/g, "");
	if (cleaned.length !== 14) return cleaned;
	return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatTelefone(tel) {
	if (!tel) return "";
	const cleaned = tel.replace(/\D/g, "");
	if (cleaned.length === 11) {
		return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	} else if (cleaned.length === 10) {
		return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	return cleaned;
}

function unformat(str) {
  	return str ? str.replace(/\D/g, "") : "";
}

function setAlert(el, messageEl, type, msg) {
	el.className = `alert alert-${type} d-block`;
	
	if (msg.includes('\n')) {
		messageEl.innerHTML = msg.replace(/\n/g, '<br>');
	} else {
		messageEl.textContent = msg;
	}
	
	el.classList.remove("d-none");
	if (type === "success") {
		setTimeout(() => hideAlert(el), 5000);
	}
}

function hideAlert(el) {
  	el.classList.add("d-none");
}

function esc(s) {
	return String(s ?? "").replace(/[&<>"']/g, m => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
	}[m]));
}

// ---- Data flow ----
async function loadClientes(q = null) {
	const term = (q ?? "").trim();
	currentQuery = term;
	const rid = ++reqSeq;

	try {
		hideAlert(globalAlert);
		showLoading();

		const data = term
		? await ClientesAPI.search(term)
		: await ClientesAPI.list();

		if (rid !== reqSeq) return;

		clientes = data;
		hideLoading();
		render(term);
	} catch (e) {
		if (rid !== reqSeq) return;
		hideLoading();
		setAlert(globalAlert, globalAlertMessage, "danger", e.message);
		render(term);
	}
}



function showLoading() {
	loadingState.classList.remove("d-none");
	tableContainer.classList.add("d-none");
	cardsContainer.classList.add("d-none");
	emptyState.classList.add("d-none");
}

function hideLoading() {
  	loadingState.classList.add("d-none");
}

function render(termoBusca = "") {
	if (clientes.length === 0) {
		tableContainer.classList.add("d-none");
		cardsContainer.classList.add("d-none");

		const titleEl = emptyState.querySelector("h2");
		const pEl = emptyState.querySelector("p");

		const hasTerm = Boolean(termoBusca && termoBusca.trim());

		if (hasTerm) {
		titleEl.textContent = "Nenhum resultado encontrado";
		pEl.textContent = `Não encontramos clientes para "${termoBusca}".`;
		} else {
		titleEl.textContent = "Nenhum cliente encontrado";
		pEl.textContent = "Comece adicionando seu primeiro cliente.";
		}

		emptyState.classList.remove("d-none");
		return;
	}

	emptyState.classList.add("d-none");
	renderTable();
	renderCards();
}

function renderTable() {
	tbody.innerHTML = clientes.map(c => `
		<tr class="fade-in">
			<td class="ps-4"><strong>${esc(c.nome_completo)}</strong></td>
			<td>${formatCPF(c.cpf)}</td>
			<td>${c.cnpj ? formatCNPJ(c.cnpj) : "<span class='text-muted'>-</span>"}</td>
			<td>${c.email ? esc(c.email) : "<span class='text-muted'>-</span>"}</td>
			<td>${c.telefone ? formatTelefone(c.telefone) : "<span class='text-muted'>-</span>"}</td>
			<td class="text-end pe-4">
				<button class="btn btn-sm btn-outline-primary me-2" data-act="edit" data-id="${c.id}">
					<i class="bi bi-pencil"></i> Editar
				</button>
				<button class="btn btn-sm btn-outline-danger" data-act="del" data-id="${c.id}">
					<i class="bi bi-trash"></i> Remover
				</button>
			</td>
		</tr>
	`).join("");
	tableContainer.classList.remove("d-none");
}

function renderCards() {
	cardsContainer.innerHTML = clientes.map(c => `
		<div class="col-12 col-md-6">
			<div class="card cliente-card shadow-sm h-100">
				<div class="card-body">
					<div class="d-flex justify-content-between align-items-start mb-3">
						<div>
							<h5 class="card-title mb-1">${esc(c.nome_completo)}</h5>
						</div>
						<div class="btn-group" role="group">
							<button class="btn btn-sm btn-outline-primary" data-act="edit" data-id="${c.id}">
								<i class="bi bi-pencil"></i>
							</button>
							<button class="btn btn-sm btn-outline-danger" data-act="del" data-id="${c.id}">
								<i class="bi bi-trash"></i>
							</button>
						</div>
					</div>
					<div class="row g-2 text-muted small">
						<div class="col-12">
							<i class="bi bi-person-badge me-2"></i>
							<strong>CPF:</strong> ${formatCPF(c.cpf)}
						</div>
						${c.cnpj ? `
						<div class="col-12">
							<i class="bi bi-building me-2"></i>
							<strong>CNPJ:</strong> ${formatCNPJ(c.cnpj)}
						</div>
						` : ""}
						${c.email ? `
						<div class="col-12">
							<i class="bi bi-envelope me-2"></i>
							<strong>Email:</strong> ${esc(c.email)}
						</div>
						` : ""}
						${c.telefone ? `
						<div class="col-12">
							<i class="bi bi-telephone me-2"></i>
							<strong>Telefone:</strong> ${formatTelefone(c.telefone)}
						</div>
						` : ""}
					</div>
				</div>
			</div>
		</div>
	`).join("");
	if (cardsContainer.innerHTML) {
		cardsContainer.classList.remove("d-none");
	}
}

function openCreateModal() {
	clienteModalTit.innerHTML = '<i class="bi bi-person-plus me-2"></i>Novo cliente';
	fId.value = "";
	fNome.value = "";
	fCpf.value = "";
	fCnpj.value = "";
	fEmail.value = "";
	fTel.value = "";
	hideAlert(formAlert);
	clienteModal.show();
	fNome.focus();
}

function openEditModal(id) {
	const c = clientes.find(x => x.id === id);
	if (!c) return;
	clienteModalTit.innerHTML = `<i class="bi bi-person-gear me-2"></i>Editar cliente`;
	fId.value = c.id;
	fNome.value = c.nome_completo || "";
	fCpf.value = formatCPF(c.cpf || "");
	fCnpj.value = formatCNPJ(c.cnpj || "");
	fEmail.value = c.email || "";
	fTel.value = formatTelefone(c.telefone || "");
	hideAlert(formAlert);
	clienteModal.show();
	fNome.focus();
}

// ---- Input Formatting ----
fCpf.addEventListener("input", (e) => {
  const value = unformat(e.target.value);
  if (value.length <= 11) {
    e.target.value = value.length === 11 ? formatCPF(value) : value;
  }
});

fCnpj.addEventListener("input", (e) => {
  const value = unformat(e.target.value);
  if (value.length <= 14) {
    e.target.value = value.length === 14 ? formatCNPJ(value) : value;
  }
});

fTel.addEventListener("input", (e) => {
  const value = unformat(e.target.value);
  if (value.length <= 11) {
    e.target.value = value;
  }
  if (value.length >= 10) {
    e.target.value = formatTelefone(value);
  }
});

// ---- Events ----
logoutBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente sair?")) {
    clearToken();
    window.location.href = "login.html";
  }
});

newBtn.addEventListener("click", openCreateModal);
emptyNewBtn.addEventListener("click", openCreateModal);

// Search with debounce
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadClientes(searchInput.value);
  }, 500);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    clearTimeout(searchTimeout);
    loadClientes(searchInput.value);
  }
});

// Table and Cards click handlers
tbody.addEventListener("click", handleAction);
cardsContainer.addEventListener("click", handleAction);

async function handleAction(e) {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === "edit") {
    openEditModal(id);
  } else if (btn.dataset.act === "del") {
    if (!confirm("Confirma remover este cliente?")) return;
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    
    try {
      await ClientesAPI.remove(id);
      clientes = clientes.filter(c => c.id !== id);
      render();
      setAlert(globalAlert, globalAlertMessage, "success", "Cliente removido com sucesso!");
    } catch (err) {
      setAlert(globalAlert, globalAlertMessage, "danger", err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

// Alert close button
globalAlert.querySelector(".btn-close")?.addEventListener("click", () => {
  hideAlert(globalAlert);
});
formAlert.querySelector(".btn-close")?.addEventListener("click", () => {
  hideAlert(formAlert);
});

clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert(formAlert);
  
  // Disable save button
  const originalText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Salvando...';

  // Get cleaned values
  const payload = {
    nome_completo: fNome.value.trim(),
    cpf: unformat(fCpf.value),
    cnpj: unformat(fCnpj.value),
    email: fEmail.value.trim(),
    telefone: unformat(fTel.value)
  };

  try {
    if (fId.value) {
      const id = Number(fId.value);
      const body = {};
      if (payload.nome_completo) body.nome_completo = payload.nome_completo;
      if (payload.cpf) body.cpf = payload.cpf;
      body.cnpj = payload.cnpj ?? "";
      body.email = payload.email || null;
      body.telefone = payload.telefone || null;

      const updated = await ClientesAPI.update(id, body);
      clientes = clientes.map(c => c.id === id ? updated : c);
      render();
      clienteModal.hide();
      setAlert(globalAlert, globalAlertMessage, "success", "Cliente atualizado com sucesso!");
    } else {
      const created = await ClientesAPI.create(payload);
      clientes.unshift(created);
      render();
      clienteModal.hide();
      setAlert(globalAlert, globalAlertMessage, "success", "Cliente criado com sucesso!");
    }
  } catch (err) {
    setAlert(formAlert, formAlertMessage, "danger", err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
  }
});

loadClientes();
