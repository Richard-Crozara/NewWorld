const token = localStorage.getItem("newworld_token");

if (!token) {
    window.location.href = "login.html";
} else {
    fetch("http://localhost:3000/api/me", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(async (response) => {
            if (!response.ok) {
                localStorage.removeItem("newworld_token");
                window.location.href = "login.html";
                return;
            }

            const data = await response.json();

            console.log("Usuário autenticado:", data.user);
        })
        .catch((error) => {
            console.error("Erro ao verificar autenticação:", error);
        });
}