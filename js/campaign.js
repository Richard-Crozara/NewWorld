const token = localStorage.getItem("newworld_token");

const campaignName = document.getElementById("campaign-name");
const campaignDescription =
    document.getElementById("campaign-description");

const logoutButton =
    document.getElementById("logout-button");

const inviteSection =
    document.getElementById("invite-section");

const inviteCode =
    document.getElementById("invite-code");

const copyInviteCodeButton =
    document.getElementById("copy-invite-code");


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

        if (data.campaign.role === "MASTER") {
            inviteSection.hidden = false;

            inviteCode.textContent =
                data.campaign.invite_code;
        }


    } catch (error) {
        console.error("Erro ao carregar campanha:", error);

        alert("Não foi possível conectar ao servidor.");

        window.location.href = "dashboard.html";
    }
}

copyInviteCodeButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(
            inviteCode.textContent
        );

        copyInviteCodeButton.textContent = "COPIADO!";

        setTimeout(() => {
            copyInviteCodeButton.textContent = "COPIAR";
        }, 2000);

    } catch (error) {
        console.error(
            "Erro ao copiar código de convite:",
            error
        );

        alert("Não foi possível copiar o código.");
    }
});

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("newworld_token");

    window.location.href = "login.html";
});