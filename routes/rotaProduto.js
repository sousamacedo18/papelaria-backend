const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

db.run("CREATE TABLE IF NOT EXISTS produto (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, descricao TEXT, estoque_minimo REAL, estoque_maximo REAL)", (createTableError) => {
    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }
});

router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    db.all('SELECT * FROM produto WHERE id=?', [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de Produtos, filtrada por ID",
            produto: rows
        });
    });
});

router.get("/", (req, res, next) => {
    db.all('SELECT * FROM produto', (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a lista de todos os Produtos",
            produtos: rows
        });
    });
});

router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    if (!status || !descricao || !estoque_minimo || !estoque_maximo) {
        return res.status(400).send({
            error: "Todos os campos são obrigatórios."
        });
    }

    db.run("UPDATE produto SET status=?, descricao=?, estoque_minimo=?, estoque_maximo=? WHERE id=?",
        [status, descricao, estoque_minimo, estoque_maximo, id], (error) => {
            if (error) {
                console.error(error);  // Adicione esta linha para imprimir detalhes do erro no console
                return res.status(500).send({
                    error: "Erro interno no servidor. Consulte os logs para obter mais detalhes."
                });
            }
            res.status(200).send({
                mensagem: "Produto atualizado com sucesso!",
            });
        });
});



router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    db.run("DELETE FROM produto WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Produto deletado com sucesso!"
        });
    });
});

router.post("/", (req, res, next) => {
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    if (!status || !descricao  || !estoque_minimo || !estoque_maximo) {
        return res.status(400).send({
            error: "Todos os campos são obrigatórios."
        });
    }

    db.serialize(() => {
        const insertProduto = db.prepare("INSERT INTO produto(status, descricao, estoque_minimo, estoque_maximo) VALUES(?,?,?,?)");
        insertProduto.run(status, descricao, estoque_minimo, estoque_maximo);
        insertProduto.finalize();
    });

    process.on("SIGINT", () => {
        db.close((err) => {
            if (err) {
                return res.status(304).send(err.message);
            }
        });
    });

    res.status(200).send({ mensagem: "Produto salvo com sucesso!" });
});

module.exports = router;
