require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "API DirCon funcionando correctamente"
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});