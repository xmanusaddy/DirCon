const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const Contact = require("../models/Contact");
const { uploadDir } = require("../middleware/uploadContactPhoto");

const hasField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

const fieldMessages = {
    name: {
        required: "El nombre es obligatorio",
        type: "El nombre debe ser una cadena de texto"
    },
    phone: {
        required: "El telefono es obligatorio",
        type: "El telefono debe ser una cadena de texto"
    },
    email: {
        required: "El correo es obligatorio",
        type: "El correo debe ser una cadena de texto"
    },
    company: {
        type: "La empresa debe ser una cadena de texto"
    },
    notes: {
        type: "Las notas deben ser una cadena de texto"
    }
};

const validateStringField = (body, field, options = {}) => {
    const { required = false, allowEmpty = true } = options;

    if (!hasField(body, field)) {
        if (required) {
            return { error: fieldMessages[field].required };
        }

        return {};
    }

    const value = body[field];

    if (typeof value !== "string") {
        return { error: fieldMessages[field].type };
    }

    const trimmedValue = value.trim();

    if (!allowEmpty && !trimmedValue) {
        return { error: fieldMessages[field].required };
    }

    return { value: trimmedValue };
};

const getPhotoUrl = (file) => file ? `/uploads/contacts/${file.filename}` : "";

const deleteUploadedFile = async (file) => {
    if (!file) return;

    try {
        await fs.unlink(file.path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(error);
        }
    }
};

const deletePhotoByUrl = async (photoUrl) => {
    if (!photoUrl || !photoUrl.startsWith("/uploads/contacts/")) return;

    const filePath = path.join(uploadDir, path.basename(photoUrl));

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error(error);
        }
    }
};

const sendValidationError = async (res, message, file) => {
    await deleteUploadedFile(file);
    return res.status(400).json({ message });
};

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
        const body = req.body || {};
        const photoUrl = getPhotoUrl(req.file);

        const name = validateStringField(body, "name", {
            required: true,
            allowEmpty: false
        });

        if (name.error) {
            return sendValidationError(res, name.error, req.file);
        }

        const phone = validateStringField(body, "phone", {
            required: true,
            allowEmpty: false
        });

        if (phone.error) {
            return sendValidationError(res, phone.error, req.file);
        }

        const email = validateStringField(body, "email", {
            required: true,
            allowEmpty: false
        });

        if (email.error) {
            return sendValidationError(res, email.error, req.file);
        }

        const company = validateStringField(body, "company");

        if (company.error) {
            return sendValidationError(res, company.error, req.file);
        }

        const notes = validateStringField(body, "notes");

        if (notes.error) {
            return sendValidationError(res, notes.error, req.file);
        }

        const contact = await Contact.create({
            name: name.value,
            phone: phone.value,
            email: email.value,
            company: company.value || "",
            notes: notes.value || "",
            photoUrl
        });

        res.status(201).json({
            message: "Contacto creado correctamente",
            contact
        });
    } catch (error) {
        await deleteUploadedFile(req.file);
        next(error);
    }
};

// Actualizar un contacto
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await deleteUploadedFile(req.file);
            return res.status(400).json({
                message: "ID de contacto no valido"
            });
        }

        const body = req.body || {};
        const shouldRemovePhoto = body.removePhoto === "true" || body.removePhoto === true;
        const fieldsToValidate = [
            {
                name: "name",
                allowEmpty: false
            },
            {
                name: "phone",
                allowEmpty: false
            },
            {
                name: "email",
                allowEmpty: false
            },
            {
                name: "company"
            },
            {
                name: "notes"
            }
        ];
        const updateData = {};

        for (const field of fieldsToValidate) {
            const result = validateStringField(body, field.name, {
                allowEmpty: field.allowEmpty
            });

            if (result.error) {
                return sendValidationError(res, result.error, req.file);
            }

            if (hasField(body, field.name)) {
                updateData[field.name] = result.value;
            }
        }

        const existingContact = await Contact.findById(id);

        if (!existingContact) {
            await deleteUploadedFile(req.file);
            return res.status(404).json({
                message: "Contacto no encontrado"
            });
        }

        if (req.file) {
            updateData.photoUrl = getPhotoUrl(req.file);
        } else if (shouldRemovePhoto) {
            updateData.photoUrl = "";
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!contact) {
            await deleteUploadedFile(req.file);
            return res.status(404).json({
                message: "Contacto no encontrado"
            });
        }

        if ((req.file || shouldRemovePhoto) && existingContact.photoUrl) {
            await deletePhotoByUrl(existingContact.photoUrl);
        }

        res.status(200).json({
            message: "Contacto actualizado correctamente",
            contact
        });
    } catch (error) {
        await deleteUploadedFile(req.file);
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

        await deletePhotoByUrl(contact.photoUrl);

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
