const ModelLocal = require("../models/localSchema.js");
const ModelReserva = require("../models/reservaSchema.js");
const global = require("../config/global.js");

// NUEVO LOCAL
exports.crearLocal = async (req, res) => {
    try {
        const { nombre, cantMesas, cantMesasDisponibles, direccion } = req.body;

        const nuevoLocal = new ModelLocal({
            nombre,
            cantMesas,
            cantMesasDisponibles,
            direccion
        });

        await nuevoLocal.save();
        res.status(201).send(nuevoLocal);
    } catch (error) {
        console.error("Error al crear el local:", error);
        res.status(500).send("Error al crear el local");
    }
};


// LISTAR TODOS LOS LOCALES EN LA BD
exports.listarLocales = async (req, res) => {
  try {
    const respuesta = await ModelLocal.find({});
    res.status(200).send(respuesta);
  } catch (error) {
    console.log("Hubo un error - listar locales");
    console.log(error);
    res.status(500).send("Hubo un error al listar los locales");
  }
};

// LISTAR DATOS DE UN LOCAL EN ESPECIFICO
exports.listarDatosLocal = async (req, res) => {
  try {
    const { nombre } = req.body;
    const respuesta = await ModelLocal.find({ nombre });
    res.status(200).send(respuesta);
  } catch (error) {
    console.log("Hubo un error - listar mesas disponibles");
    console.log(error);
    res.status(500).send("Hubo un error - listar mesas disponibles");
  }
};

// LISTAR RESERVAS DE UN LOCAL EN UNA HORA ESPECIFICA
exports.listarReservasPorHora = async (req, res) => {
  try {
    const { nombre, horaEntradaReserva, horaSalidaReserva } = req.body;

    const local = await ModelLocal.findOne({ nombre });
    if (!local) {
      return res.status(404).send("Local no encontrado");
    }

    const listaReservas = await ModelReserva.find({
      local: local._id,
      horaEntradaReserva: { $gte: horaEntradaReserva },
      horaSalidaReserva: { $lte: horaSalidaReserva },
    });

    res.status(200).send(listaReservas);
  } catch (error) {
    console.log("Hubo un error - listar reservas por hora");
    console.log(error);
    res.status(500).send("Hubo un error al listar reservas por hora");
  }
};


// AGREGAR RESERVA
exports.agregarReserva = async (req, res) => {
  try {
    const { nombre } = req.body; // ID del local
    const datosReserva = req.body; // Datos de la nueva reserva

    // Verificar que el local existe
    const local = await ModelLocal.findOne({nombre: nombre});
    if (!local) {
      return res.status(404).json({ mensaje: 'Local no encontrado' });
    }

    // Crear la nueva reserva
    const nuevaReserva = new ModelReserva({ ...datosReserva, local: local._id });
    await nuevaReserva.save();

    // Actualizar las reservas del local (opcional si llevas referencia)
    local.reservas.push(nuevaReserva._id); 
    await local.save();

    res.status(201).json({ mensaje: 'Reserva creada con éxito', nuevaReserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al agregar la reserva' });
  }
};

