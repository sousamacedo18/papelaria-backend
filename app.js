const express = require('express')
const app = express();
app.use(express.json());
const morgan = require("morgan");
app.use(morgan("dev"));

const rotaUsuarios = require("./routes/rotaUsuario");


app.use("/usuario",rotaUsuarios);

module.exports = app