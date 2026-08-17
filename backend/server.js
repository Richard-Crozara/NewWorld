const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: "https://richard-crozara.github.io"
}));

app.use(express.json());

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            mensagem: "New World backend conectado ao PostgreSQL!",
            horarioDoBanco: result.rows[0].now
        });
    } catch (error) {
        console.error("Erro ao conectar ao banco:", error);

        res.status(500).json({
            erro: "Não foi possível conectar ao banco de dados."
        });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedUsername.length < 3) {
            return res.status(400).json({
                erro: "O nome de usuário deve ter pelo menos 3 caracteres."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                erro: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [normalizedUsername, normalizedEmail, hashedPassword]
        );

        return res.status(201).json({
            mensagem: "Usuário criado com sucesso!",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                erro: "Este nome de usuário ou e-mail já está em uso."
            });
        }

        return res.status(500).json({
            erro: "Não foi possível criar o usuário."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});