const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.name === "MulterError") {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "La imagen no puede superar 5 MB"
            : "No se pudo subir la imagen";

        return res.status(400).json({
            message
        });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
            (err) => err.message
        );

        return res.status(400).json({
            message: messages[0]
        });
    }

    if (error.name === "CastError") {
        return res.status(400).json({
            message: "ID de contacto no valido"
        });
    }

    res.status(500).json({
        message: "Error interno del servidor"
    });
};

module.exports = errorHandler;
