const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "contacts");
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
]);

fs.mkdirSync(uploadDir, {
    recursive: true
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
        cb(null, true);
        return;
    }

    const error = new Error("Solo se permiten imagenes JPG, PNG, GIF o WEBP");
    error.statusCode = 400;
    cb(error);
};

const uploadContactPhoto = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single("photo");

module.exports = {
    uploadContactPhoto,
    uploadDir
};
