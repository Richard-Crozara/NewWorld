const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.erro || "Não foi possível realizar o login.");
            return;
        }

        localStorage.setItem("newworld_token", data.token);

alert("Login realizado com sucesso!");

window.location.href = "dashboard.html";

alert("Login realizado com sucesso!");

window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Erro ao fazer login:", error);

        alert("Não foi possível conectar ao servidor.");
    }
});