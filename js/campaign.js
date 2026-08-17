const token = localStorage.getItem("newworld_token");

const campaignName = document.getElementById("campaign-name");
const campaignDescription =
    document.getElementById("campaign-description");

const logoutButton =
    document.getElementById("logout-button");

const params = new URLSearchParams(window.location.search);

const campaignId = params.get("id");

if (!token) {
    window.location.href = "login.html";
} else if (!campaignId) {
    window.location.href = "dashboard.html";
} else {
    loadCampaign();
}

async function loadCampaign() {
    try {
        const response = await fetch(
            `http://localhost:3000/api/campaigns/${campaignId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.erro ||
                "Não foi possível acessar esta campanha."
            );

            window.location.href = "dashboard.html";
            return;
        }

        campaignName.textContent = data.campaign.name;

        campaignDescription.textContent =
            data.campaign.description ||
            "Sem descrição.";

        document.title =
            `${data.campaign.name} — New World`;

    } catch (error) {
        console.error("Erro ao carregar campanha:", error);

        alert("Não foi possível conectar ao servidor.");

        window.location.href = "dashboard.html";
    }
}

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("newworld_token");

    window.location.href = "login.html";
});