const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

// Criação da tabela de saída no banco de dados, caso não exista
db.run("CREATE TABLE IF NOT EXISTS saida (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL, data_saida DATE)", (createTableError) => {
    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }
});

// Filtrar produtos por ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    db.all('SELECT * FROM saida WHERE id_produto=?', [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de Saídas, filtrada por ID de Produto",
            saidas: rows
        });
    });
});

// Lista todas as saídas do banco de dados
router.get("/", (req, res, next) => {
    db.all('SELECT * FROM saida INNER JOIN produto on saida.id_produto = produto.id', (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de todas as Saídas",
            saidas: rows
        });
    });
});

// Rota para atualizar uma saída
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { id_produto, quantidade, valor_unitario, data_saida } = req.body;

    db.run("UPDATE saida SET id_produto=?, quantidade=?, valor_unitario=?, data_saida=? WHERE id=?",
        [id_produto, quantidade, valor_unitario, data_saida, id], (error) => {
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Saída atualizada com sucesso!",
            });
        });
});

// Rota para excluir uma saída
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    db.run("DELETE FROM saida WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Saída deletada com sucesso!"
        });
    });
});

// Rota para salvar uma nova saída
router.post("/", (req, res, next) => {
    const { id_produto, quantidade, valor_unitario, data_saida } = req.body;

    db.serialize(() => {
        const insertSaida = db.prepare("INSERT INTO saida(id_produto, quantidade, valor_unitario, data_saida) VALUES(?,?,?,?)");
        insertSaida.run(id_produto, quantidade, valor_unitario, data_saida);
        insertSaida.finalize();
    });

    process.on("SIGINT", () => {
        db.close((err) => {
            if (err) {
                return res.status(304).send(err.message);
            }
        });
    });

    res.status(200).send({ mensagem: "Saída salva com sucesso!" });
});

module.exports = router;
