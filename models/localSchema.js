const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        cantMesas: {
            type: Number,
            required: true
        },
        cantMesasDisponibles: {
            type: Number,
            required: true
        },
        direccion: {
            type: String,
            required: true
        },
        reservas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'reservas'
            }
        ] // Este campo estará vacío al crear un local
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ModelLocales = mongoose.model('Local', LocalSchema, 'locales');
module.exports = ModelLocales;
