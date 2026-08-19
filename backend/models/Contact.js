const mongoose = require("mongoose");

const extraLinkSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true
        },

        label: {
            type: String,
            trim: true,
            default: ""
        },

        value: {
            type: String,
            required: true,
            trim: true
        },

        url: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: false
    }
);

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true
        },

        phone: {
            type: String,
            required: [true, "El telefono es obligatorio"],
            trim: true
        },

        email: {
            type: String,
            required: [true, "El correo es obligatorio"],
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "El correo no tiene un formato valido"
            ]
        },

        company: {
            type: String,
            trim: true,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        },

        photoUrl: {
            type: String,
            trim: true,
            default: ""
        },

        extraLinks: {
            type: [extraLinkSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
