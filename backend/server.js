const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                erro: "Preencha e-mail e senha."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT id, username, email, password
             FROM users
             WHERE email = $1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        const token = jwt.sign(
    {
        id: user.id,
        username: user.username
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

return res.status(200).json({
    mensagem: "Login realizado com sucesso!",
    token,
    user: {
        id: user.id,
        username: user.username,
        email: user.email
    }
});

    } catch (error) {
        console.error("Erro ao fazer login:", error);

        return res.status(500).json({
            erro: "Não foi possível realizar o login."
        });
    }
});

app.get("/api/me", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            erro: "Token não fornecido."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            user: {
                id: decoded.id,
                username: decoded.username
            }
        });

    } catch (error) {
        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });
    }
});

app.post("/api/campaigns", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            erro: "Token não fornecido."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                erro: "O nome da campanha é obrigatório."
            });
        }

        const normalizedName = name.trim();
        const normalizedDescription = description
            ? description.trim()
            : null;

        const inviteCode = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const campaignResult = await client.query(
                `INSERT INTO campaigns (name, description, invite_code)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, description, invite_code, created_at`,
                [
                    normalizedName,
                    normalizedDescription,
                    inviteCode
                ]
            );

            const campaign = campaignResult.rows[0];

            await client.query(
                `INSERT INTO campaign_members (campaign_id, user_id, role)
                 VALUES ($1, $2, 'MASTER')`,
                [
                    campaign.id,
                    decoded.id
                ]
            );

            await client.query("COMMIT");

            return res.status(201).json({
                mensagem: "Campanha criada com sucesso!",
                campaign
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Erro ao criar campanha:", error);

        return res.status(500).json({
            erro: "Não foi possível criar a campanha."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});