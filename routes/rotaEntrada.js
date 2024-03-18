const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

// Criação da tabela de entrada no banco de dados, caso não exista
db.run("CREATE TABLE IF NOT EXISTS entrada (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL, data_entrada DATE)", (createTableError) => {
    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }
});

// Filtrar produtos por ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    db.all('SELECT * FROM entrada WHERE id_produto=?', [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de Entradas, filtrada por ID de Produto",
            entradas: rows
        });
    });
});

// Lista todas as entradas do banco de dados
router.get("/", (req, res, next) => {
    db.all(`SELECT 
            entrada.id as id, 
            entrada.id_produto as id_produto,
            entrada.quantidade as quantidade,
            entrada.data_entrada as data_entrada,
            produto.descricao as descricao,
            entrada.valor_unitario as valor_unitario
            FROM entrada 
            INNER JOIN produto 
            ON entrada.id_produto = produto.id`, (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de todas as Entradas",
            entradas: rows
        });
    });
});

// Rota para atualizar uma entrada
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    db.run("UPDATE entrada SET id_produto=?, quantidade=?, valor_unitario=?, data_entrada=? WHERE id=?",
        [id_produto, quantidade, valor_unitario, data_entrada, id], (error) => {
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Entrada atualizada com sucesso!",
            });
        });
});

// Rota para excluir uma entrada
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    db.run("DELETE FROM entrada WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Entrada deletada com sucesso!"
        });
    });
});

// Rota para salvar uma nova entrada
router.post("/", (req, res, next) => {
    const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    db.serialize(() => {
        const insertEntrada = db.prepare("INSERT INTO entrada(id_produto, quantidade, valor_unitario, data_entrada) VALUES(?,?,?,?)");
        insertEntrada.run(id_produto, quantidade, valor_unitario, data_entrada);
        insertEntrada.finalize();
    });

    process.on("SIGINT", () => {
        db.close((err) => {
            if (err) {
                return res.status(304).send(err.message);
            }
        });
    });

    res.status(200).send({ mensagem: "Entrada salva com sucesso!" });
});

module.exports = router;
