const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 3000;

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

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});