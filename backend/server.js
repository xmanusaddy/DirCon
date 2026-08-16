require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "API DirCon funcionando correctamente"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});