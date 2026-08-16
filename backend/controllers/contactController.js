const mongoose = require("mongoose");
const Contact = require("../models/Contact");

// Obtener todos los contactos y buscar por nombre
const getContacts = async (req, res, next) => {
    try {
        const { search } = req.query;

        let filter = {};

        if (search && search.trim()) {
            filter.name = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        const contacts = await Contact.find(filter).sort({ createdAt: -1 });

        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

// Obtener un contacto por ID
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID de contacto no valido"
            });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                message: "Contacto no encontrado"
            });
        }

        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

// Crear un contacto
const createContact = async (req, res, next) => {
    try {
        const { name, phone, email, company, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "El nombre es obligatorio"
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                message: "El telefono es obligatorio"
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "El correo es obligatorio"
            });
        }

        const contact = await Contact.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            company: company ? company.trim() : "",
            notes: notes ? notes.trim() : ""
        });

        res.status(201).json({
            message: "Contacto creado correctamente",
            contact
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar un contacto
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID de contacto no valido"
            });
        }

        const { name, phone, email, company, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "El nombre es obligatorio"
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                message: "El telefono es obligatorio"
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "El correo es obligatorio"
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                company: company ? company.trim() : "",
                notes: notes ? notes.trim() : ""
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contacto no encontrado"
            });
        }

        res.status(200).json({
            message: "Contacto actualizado correctamente",
            contact
        });
    } catch (error) {
        next(error);
    }
};

// Eliminar un contacto
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID de contacto no valido"
            });
        }

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                message: "Contacto no encontrado"
            });
        }

        res.status(200).json({
            message: "Contacto eliminado correctamente",
            contact
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
};