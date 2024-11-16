const ModelReserva = require("../models/reservaSchema");
const ModelLocal = require("../models/localSchema.js");
const global = require("../config/global.js");

// NUEVA RESERVA
exports.nuevaReserva = async (req, res) => {
    try {
        const { 
            local, // ahora se espera el nombre del local
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

        console.log(localBD)

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

        await nuevaReserva.save();
        console.log(`nueva reserva agregada`);
        return res.json(reserva);
    } catch (error) {
        console.log(error);
        return res.status(409).send("Hubo un error al crear la reserva");
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

