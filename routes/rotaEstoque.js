const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

// Criação da tabela de estoque no banco de dados, caso não exista
db.run("CREATE TABLE IF NOT EXISTS estoque (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL)", (createTableError) => {
    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }
});

// Filtrar produtos no estoque por ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    db.all('SELECT * FROM estoque WHERE id_produto=?', [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de Produtos no Estoque, filtrada por ID",
            estoque: rows
        });
    });
});

// Lista todo o estoque do banco de dados
router.get("/", (req, res, next) => {
    db.all(`SELECT 
    estoque.id as id, 
    estoque.id_produto as id_produto,
    estoque.quantidade as quantidade,
    produto.descricao as descricao,
    estoque.valor_unitario as valor_unitario
    FROM estoque 
    INNER JOIN produto 
    ON estoque.id_produto = produto.id`, (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de todo o Estoque",
            estoques: rows
        });
    });
});

// Rota para atualizar uma entrada no estoque
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { id_produto, quantidade, valor_unitario } = req.body;

    db.run("UPDATE estoque SET id_produto=?, quantidade=?, valor_unitario=? WHERE id=?",
        [id_produto, quantidade, valor_unitario, id], (error) => {
            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Estoque atualizado com sucesso!",
            });
        });
});

// Rota para excluir uma entrada no estoque
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    db.run("DELETE FROM estoque WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Entrada no Estoque deletada com sucesso!"
        });
    });
});

// Rota para salvar uma nova entrada no estoque
router.post("/", (req, res, next) => {
    const { id_produto, quantidade, valor_unitario } = req.body;

    db.serialize(() => {
        const insertEstoque = db.prepare("INSERT INTO estoque(id_produto, quantidade, valor_unitario) VALUES(?,?,?)");
        insertEstoque.run(id_produto, quantidade, valor_unitario);
        insertEstoque.finalize();
    });

    process.on("SIGINT", () => {
        db.close((err) => {
            if (err) {
                return res.status(304).send(err.message);
            }
        });
    });

    res.status(200).send({ mensagem: "Entrada no Estoque salva com sucesso!" });
});

module.exports = router;
