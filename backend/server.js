require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "API DirCon funcionando correctamente"
    });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Servidor ejecutandose en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

startServer();
