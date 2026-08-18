const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI no esta definida en las variables de entorno");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB conectado correctamente");
    } catch (error) {
        throw new Error(`Error al conectar con MongoDB: ${error.message}`);
    }
};

module.exports = connectDB;
