const token = localStorage.getItem("newworld_token");

const logoutButton =
    document.getElementById("logout-button");

const charactersGrid =
    document.getElementById("characters-grid");

const openCreateCharacterButton =
    document.getElementById("open-create-character");

const createCharacterModal =
    document.getElementById("create-character-modal");

const closeCreateCharacterButton =
    document.getElementById("close-create-character");

const createCharacterForm =
    document.getElementById("create-character-form");

const characterNameInput =
    document.getElementById("character-name");


/* =========================
   AUTENTICAÇÃO
   ========================= */

if (!token) {
    window.location.href = "login.html";
} else {
    loadCharacters();
}


/* =========================
   BUSCAR PERSONAGENS
   ========================= */

async function loadCharacters() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/characters",
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
                "Não foi possível carregar os personagens."
            );

            return;
        }

        renderCharacters(data.characters);

    } catch (error) {
        console.error(
            "Erro ao carregar personagens:",
            error
        );

        alert("Não foi possível conectar ao servidor.");
    }
}


/* =========================
   MOSTRAR PERSONAGENS
   ========================= */

function renderCharacters(characters) {
    const existingCharacters =
        charactersGrid.querySelectorAll(".character-card");

    existingCharacters.forEach((character) => {
        character.remove();
    });

    const createCharacterButton =
        document.getElementById("open-create-character");

    characters.forEach((character) => {
        const characterCard =
            document.createElement("article");

        characterCard.classList.add("campaign-card");
        characterCard.classList.add("character-card");

        characterCard.innerHTML = `
            <div class="campaign-card-top">

                <span class="campaign-status">
                    PERSONAGEM
                </span>

            </div>

            <h2>
                ${character.name}
            </h2>

            <p>
                Personagem em criação.
            </p>

            <div class="campaign-footer">

                <span>
                    New World
                </span>

                <button
                    type="button"
                    class="enter-character-button"
                    data-character-id="${character.id}"
                >
                    ABRIR
                </button>

            </div>
        `;

        charactersGrid.insertBefore(
            characterCard,
            createCharacterButton
        );
    });
}


/* =========================
   CRIAR PERSONAGEM
   ========================= */

createCharacterForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const name =
            characterNameInput.value.trim();

        try {
            const response = await fetch(
                "http://localhost:3000/api/characters",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.erro ||
                    "Não foi possível criar o personagem."
                );

                return;
            }

            alert("Personagem criado com sucesso!");

            createCharacterForm.reset();

            createCharacterModal.hidden = true;

            loadCharacters();

        } catch (error) {
            console.error(
                "Erro ao criar personagem:",
                error
            );

            alert("Não foi possível conectar ao servidor.");
        }
    }
);


/* =========================
   MODAL
   ========================= */

openCreateCharacterButton.addEventListener(
    "click",
    () => {
        createCharacterModal.hidden = false;
    }
);

closeCreateCharacterButton.addEventListener(
    "click",
    () => {
        createCharacterModal.hidden = true;
    }
);


/* =========================
   ABRIR PERSONAGEM
   ========================= */

charactersGrid.addEventListener(
    "click",
    (event) => {
        const openButton =
            event.target.closest(
                ".enter-character-button"
            );

        if (!openButton) {
            return;
        }

        const characterId =
            openButton.dataset.characterId;

        alert(
            `A ficha do personagem ${characterId} será aberta aqui.`
        );
    }
);


/* =========================
   LOGOUT
   ========================= */

logoutButton.addEventListener(
    "click",
    (event) => {
        event.preventDefault();

        localStorage.removeItem(
            "newworld_token"
        );

        window.location.href = "login.html";
    }
);