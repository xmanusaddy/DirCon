const express = require("express");

const {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

const router = express.Router();

// Obtener todos los contactos
router.get("/", getContacts);

// Obtener un contacto por ID
router.get("/:id", getContactById);

// Crear un contacto
router.post("/", createContact);

// Actualizar un contacto
router.put("/:id", updateContact);

// Eliminar un contacto
router.delete("/:id", deleteContact);

module.exports = router;