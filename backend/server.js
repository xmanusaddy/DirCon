require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// Conectar con MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal de contactos
app.use("/api/contacts", contactRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        message: "API DirCon funcionando correctamente"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});