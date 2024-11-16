const mongoose = require('mongoose');

// Esquema de Reserva
const ReservaSchema = new mongoose.Schema(
    {
        local: {
            type: mongoose.Schema.Types.ObjectId, // Cambiado para referenciar un local
            ref: 'Local', // Relacionado con el modelo 'Local'
            required: true
        },
        cantPersonas: {
            type: Number,
            required: true
        },
        fechaReserva: {
            type: String,
            required: true
        },
        horaEntradaReserva: {
            type: String,
            required: true
        },
        horaSalidaReserva: {
            type: String,
            required: true
        },
        ocasionEsp: {
            type: Boolean,
            required: true
        },
        personaDisc: {
            type: Boolean,
            required: true
        },
        nesecidadExtra: {
            type: String,
            required: true
        },
        nomCliente: {
            type: String,
            required: true
        },
        apeCliente: {
            type: String,
            required: true
        },
        emailCliente: {
            type: String,
            required: true
        },
        celCliente: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Crear el modelo para 'Reserva'
const ModelReserva = mongoose.model('Reserva', ReservaSchema, 'reservas');

module.exports = ModelReserva;
