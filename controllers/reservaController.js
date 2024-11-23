require('dotenv').config(); 
const ModelLocal = require("../models/localSchema.js");
const ModelReserva = require("../models/reservaSchema");
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Función para generar un código de confirmación aleatorio de 6 dígitos
const generarCodigoReserva = () => {
    // Crear un código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    return codigo;
};

// NUEVA RESERVA
exports.nuevaReserva = async (req, res) => {
    try {
        const {
            local, // nombre del local
            cantPersonas,
            fechaReserva,
            horaEntradaReserva,
            horaSalidaReserva,
            ocasionEsp,
            personaDisc,
            nesecidadExtra,
            nomCliente,
            apeCliente,
            emailCliente,
            celCliente
        } = req.body;

        // Encontrar local por su nombre
        const localBD = await ModelLocal.findOne({ nombre: local });

        if (!localBD) return res.status(404).send("No se encontró el local para asignar la reserva");

        const reserva = {
            local: localBD._id,
            cantPersonas,
            fechaReserva,
            horaEntradaReserva,
            horaSalidaReserva,
            ocasionEsp,
            personaDisc,
            nesecidadExtra,
            nomCliente,
            apeCliente,
            emailCliente,
            celCliente,
        };

        const nuevaReserva = new ModelReserva(reserva);

        // Generar el código de confirmación
        const codigo = generarCodigoReserva();

        // Guardar el código en la reserva para futura verificación
        nuevaReserva.codigoConfirmacion = codigo;

        console.log(nuevaReserva)

        await nuevaReserva.save();
        console.log(`nueva reserva agregada`);

        // Enviar el mensaje con el código de confirmación por WhatsApp
        const mensaje = `Hola! ${nomCliente}. Confirma tu reserva en el local: ${local} para ${cantPersonas} persona(s) el ${fechaReserva} desde ${horaEntradaReserva} hasta ${horaSalidaReserva}. Usa el código para confirmar tu reserva: ${codigo}`;

        try {
            const message = await client.messages.create({
                from: 'whatsapp:+14155238886',  // Número del Sandbox de Twilio
                to: `whatsapp:+51${celCliente}`, // Número del cliente en formato E.164
                body: mensaje,                   // Mensaje con el código de confirmación
            });
            console.log(`Mensaje enviado con SID: ${message.sid}`);
        } catch (error) {
            console.error("Error al enviar el mensaje:", error.message);
        }

        return res.json(reserva);
    } catch (error) {
        console.log(error);
        return res.status(409).send("Hubo un error al crear la reserva");
    }
};

// Verificar código de confirmación
exports.verificarCodigo = async (req, res) => {
    try {
        const { codigoConfirmacion, reservaId , nombre} = req.body;

        const local = await ModelLocal.findOne({nombre: nombre});

        if (!codigoConfirmacion) {
            return res.status(400).send("Se requiere el código de confirmación.");
        }

        // Buscar la reserva con el ID proporcionado
        const reserva = await ModelReserva.findOne({ _id: reservaId });

        if (!reserva) {
            return res.status(404).send("Reserva no encontrada.");
        }

        // Verificar si el código ingresado coincide con el código guardado en la reserva
        if (reserva.codigoConfirmacion !== codigoConfirmacion) {
            return res.status(401).send("Código de confirmación inválido.");
        }

        // Confirmar la reserva
        reserva.confirmada = true; // Asumimos que existe un campo "confirmada" en el modelo
        await reserva.save();

        local.reservas.push(reservaId);
        await local.save();

        return res.status(200).send("Reserva confirmada con éxito.");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Hubo un error al verificar el código.");
    }
};

// LISTAR TODAS LAS RESERVAS EN LA BD
exports.listarReservas = async (req, res) => {
    try {
        const respuesta = await ModelReserva.find({});
        res.status(200).send(respuesta);
    } catch (error) {
        console.log("Hubo un error - listar reservas");
        console.log(error);
        res.status(500).send("Hubo un error");
    }
};

// LISTAR RESERVAS POR FECHA
exports.listarReservasFecha = async (req, res) => {
    try {
        const { fechaReserva } = req.body;
        //año-mes-dia
        const respuesta = await ModelReserva.find({ fechaReserva: fechaReserva });

        res.status(200).send(respuesta);
    } catch (error) {
        console.log("Hubo un error - listar reservas x fecha");
        console.log(error);
        res.status(500).send("Hubo un error al listar reservas por fecha");
    }
};

// LISTAR RESERVAS POR HORA DE UN LOCAL ESPECIFICO
exports.listarReservasPorHora = async (req, res) => {
    try {
        const { nombre, horaEntradaReserva, horaSalidaReserva } = req.body;

        const localEncontrado = await ModelLocal.findOne({ nombre: nombre });

        if (!localEncontrado) {
            return res.status(404).send("Local no encontrado");
        }

        const reservas = await ModelReserva.find({
            local: localEncontrado._id, // Usamos el _id del local encontrado
            horaEntradaReserva: { $gte: horaEntradaReserva },
            horaSalidaReserva: { $lte: horaSalidaReserva }
        });

        res.status(200).send(reservas);
    } catch (error) {
        console.log("Hubo un error - listar reservas por hora");
        console.log(error);
        res.status(500).send("Hubo un error al listar reservas por hora");
    }
};

// LISTAR MESAS DISPONIBLES DE UN LOCAL EN UNA HORA ESPECIFICA
exports.listarMesasDisponibles = async (req, res) => {
    try {
        const { nombre, horaEntradaReserva, horaSalidaReserva } = req.body;

        const localEncontrado = await ModelLocal.findOne({ nombre: nombre });

        if (!localEncontrado) {
            return res.status(404).send("Local no encontrado");
        }

        // Contar cuántas mesas ya están reservadas en esa hora
        const reservas = await ModelReserva.find({
            local: localEncontrado._id, // Usamos el _id del local
            horaEntradaReserva: { $lte: horaSalidaReserva },
            horaSalidaReserva: { $gte: horaEntradaReserva }
        });

        const mesasDisponibles = localEncontrado.cantMesas - reservas.length;

        res.status(200).send({ mesasDisponibles });
    } catch (error) {
        console.log("Hubo un error - listar mesas disponibles");
        console.log(error);
        res.status(500).send("Hubo un error al listar mesas disponibles");
    }
};
