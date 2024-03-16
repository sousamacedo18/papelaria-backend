const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
db.run("CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT, senha TEXT)", (createTableError) => {
    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }

    // O restante do código, se necessário...
});

// PESQUISAR USUÁRIO POR ID
router.get("/:id",(req,res,next)=>{
    const {id} = req.params;
    db.all('SELECT * FROM usuario WHERE id=?',[id],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
     
        res.status(200).send({
            mensagem:"Aqui está a lista de Usuários",
            usuario:rows
        })
    })
  
})

//FAZER LOGIN NO SISTEMA
router.post("/login",(req,res,next)=>{
    const {email,senha} =req.body;
  
    db.get("SELECT id, nome, email FROM usuario WHERE email=? and senha=? ",[email,senha],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        
        if(!rows){
               return res.status(404).send({
                mensagem:"Email ou senha estão incorretos!"
       
            })
        }else{
            res.status(200).send({
                mensagem:"Dados de login estão corretos!",
                usuarios:rows
            });   
        }
        console.log(rows)
    })
  
})
// aqui consultamos todos os usuários cadastro no banco
router.get("/",(req,res,next)=>{
    db.all("SELECT * FROM usuario",(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Aqui está a lista de Usuários",
            usuarios:rows
        })
    })
  
})
// pesquisar usuário pelo nome
router.get("/nomes",(req,res,next)=>{
    const nome = req.body.nome;
    db.all("SELECT id, nome FROM usuario nome like ? ",[nome],(error,rows)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Aqui está a lista de Usuários",
            usuarios:rows
        })
    })
  
})
// aqui salvamos dados do usuário
router.post("/",(req,res,next)=>{

    const {nome,email,senha} = req.body;

    db.serialize(()=>{
        db.run("CREATE TABLE IF NOT EXISTS usuario(id INTEGER PRIMARY KEY AUTOINCREMENT,nome TEXT, email TEXT UNIQUE, senha TEXT)")
        const insertUsuario = db.prepare("INSERT INTO usuario(nome,email,senha) VALUES(?,?,?)")
        insertUsuario.run(nome,email,senha);
        insertUsuario.finalize();
    })

    process.on("SIGINT",()=>{
        db.close((err)=>{
            if(err){
                return res.status(304).send(err.message);
            }
        })
    })
    
  

    res.status(200).send({mensagem:"Salvo com sucesso!"});

});
// aqui podemos alterar dados do usuário
router.put("/",(req,res,next)=>{
    const {id,nome,email,senha} = req.body;
    db.run("UPDATE usuario SET nome=?,email=?,senha=? WHERE id=?",
    [nome,email,senha,id],function(error){
        if(error){
            return res.status(500).send({
                error:error.message
            });
        }
        res.status(200).send({
            mensagem:"Cadastro Alterado com Sucesso!",
           
        })  
    })
    
    
  
  });
  // Aqui podemos deletar o cadastro de um usuário por meio do id
  router.delete("/:id",(req,res,next)=>{
    const {id} = req.params;
    db.run("DELETE FROM usuario WHERE id= ?",id,(error)=>{
        if(error){
            return res.status(500).send({
                error:error.message
            }); 
        } 
        res.status(200).send({
            mensagem:"Cadastro deletado com sucesso!!"
        })  
    });
     
  
  });
module.exports = router;