const errorHandler = (error, req, res, next) => {
    console.error(error);

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