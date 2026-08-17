console.log("register.js carregado!");

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    if (password !== passwordConfirm) {
        alert("As senhas não coincidem.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.erro || "Não foi possível criar a conta.");
            return;
        }

        alert("Conta criada com sucesso!");

        window.location.href = "login.html";

    } catch (error) {
        console.error("Erro ao registrar:", error);

        alert("Não foi possível conectar ao servidor.");
    }
});