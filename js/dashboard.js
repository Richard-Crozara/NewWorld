const token = localStorage.getItem("newworld_token");

const loggedUser = document.getElementById("logged-user");
const logoutButton = document.getElementById("logout-button");
const campaignGrid = document.querySelector(".campaign-grid");

const openCreateCampaignButton =
    document.getElementById("open-create-campaign");

const createCampaignModal =
    document.getElementById("create-campaign-modal");

const closeCreateCampaignButton =
    document.getElementById("close-create-campaign");

const createCampaignForm =
    document.getElementById("create-campaign-form");

const campaignNameInput =
    document.getElementById("campaign-name");

const campaignDescriptionInput =
    document.getElementById("campaign-description");

createCampaignForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = campaignNameInput.value.trim();
    const description =
        campaignDescriptionInput.value.trim();

    try {
        const response = await fetch(
            "http://localhost:3000/api/campaigns",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.erro ||
                "Não foi possível criar a campanha."
            );

            return;
        }

        alert("Campanha criada com sucesso!");

        createCampaignForm.reset();

        createCampaignModal.hidden = true;

        loadCampaigns();

    } catch (error) {
        console.error("Erro ao criar campanha:", error);

        alert("Não foi possível conectar ao servidor.");
    }
});

if (!token) {
    window.location.href = "login.html";
} else {
    loadUser();
    loadCampaigns();
}

async function loadUser() {
    try {
        const response = await fetch("http://localhost:3000/api/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem("newworld_token");
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();

        loggedUser.textContent =
            `Conectado como: ${data.user.username}`;

    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);

        localStorage.removeItem("newworld_token");
        window.location.href = "login.html";
    }
}

async function loadCampaigns() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/campaigns",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Não foi possível buscar campanhas.");
        }

        const data = await response.json();

        renderCampaigns(data.campaigns);

    } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
    }
}

function renderCampaigns(campaigns) {
    const existingCampaigns =
        campaignGrid.querySelectorAll(".campaign-card");

    existingCampaigns.forEach((campaign) => {
        campaign.remove();
    });

    campaigns.forEach((campaign) => {
        const campaignCard = document.createElement("article");

        campaignCard.classList.add("campaign-card");

        campaignCard.innerHTML = `
            <div class="campaign-card-top">

                <span class="campaign-status">
                    ATIVA
                </span>

                <span class="campaign-members">
                    ${campaign.role === "MASTER"
                        ? "Mestre"
                        : "Jogador"}
                </span>

            </div>

            <h2>
                ${campaign.name}
            </h2>

            <p>
                ${campaign.description ||
                    "Sem descrição."}
            </p>

            <div class="campaign-footer">

                <span>
                    ${campaign.role === "MASTER"
                        ? "Você é o mestre"
                        : "Você é jogador"}
                </span>

                <button>
                    ENTRAR
                </button>

            </div>
        `;

        const createCampaignButton =
            campaignGrid.querySelector(".create-campaign");

        campaignGrid.insertBefore(
            campaignCard,
            createCampaignButton
        );
    });
}

openCreateCampaignButton.addEventListener("click", () => {
    createCampaignModal.hidden = false;
});

closeCreateCampaignButton.addEventListener("click", () => {
    createCampaignModal.hidden = true;
});

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("newworld_token");

    window.location.href = "login.html";
});