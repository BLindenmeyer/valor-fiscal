// Redireciona se já estiver logado
if (localStorage.getItem("token")) {
    window.location.href = "app.html";
}

const form = document.getElementById("loginForm");
const alertBox = document.getElementById("loginAlert");

function showError(msg) {
    alertBox.textContent = msg;
    alertBox.classList.remove("d-none");
}
function hideError() {
    alertBox.classList.add("d-none");
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!user || !pass) {
        showError("Preencha usuário e senha.");
        return;
    }

	// Login mockado
    if (user === "admin" && pass === "admin") {
        localStorage.setItem("token", "token");
        window.location.href = "app.html";
    } else {
        showError("Usuário ou senha inválidos.");
    }
});
