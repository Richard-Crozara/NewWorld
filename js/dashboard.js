const token = localStorage.getItem("newworld_token");

const loggedUser = document.getElementById("logged-user");
const logoutButton = document.getElementById("logout-button");

if (!token) {
    window.location.href = "login.html";
} else {
    fetch("http://localhost:3000/api/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(async (response) => {
            if (!response.ok) {
                localStorage.removeItem("newworld_token");
                window.location.href = "login.html";
                return;
            }

            const data = await response.json();

            loggedUser.textContent = `Conectado como: ${data.user.username}`;
        })
        .catch((error) => {
            console.error("Erro ao verificar autenticação:", error);

            localStorage.removeItem("newworld_token");
            window.location.href = "login.html";
        });
}

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("newworld_token");

    window.location.href = "login.html";
});