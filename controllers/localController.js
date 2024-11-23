const ModelLocal = require("../models/localSchema.js");
const ModelReserva = require("../models/reservaSchema.js");
const twilio = require('twilio');
const global = require("../config/global.js");

const accountSid = global.accountSid;
const authToken = global.authToken;
const client = twilio(accountSid, authToken);

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

// Función para generar un código de confirmación aleatorio de 6 dígitos
const generarCodigoReserva = () => {
  // Crear un código aleatorio de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  return codigo;
};

// AGREGAR RESERVA
exports.agregarReserva = async (req, res) => {
  try {
    const { nombre } = req.body; // nombre del local
    const datosReserva = req.body; // Datos de la nueva reserva

    // Verificar que el local existe
    const local = await ModelLocal.findOne({ nombre: nombre });
    if (!local) {
      return res.status(404).json({ mensaje: 'Local no encontrado' });
    }

    if (!datosReserva.nesecidadExtra || datosReserva.nesecidadExtra.trim() == "") datosReserva.nesecidadExtra = "ninguna"

    // Crear la nueva reserva
    const nuevaReserva = new ModelReserva({ ...datosReserva, local: local._id });

    // Generar el código de confirmación
    const codigo = generarCodigoReserva();

    // Guardar el código en la reserva para futura verificación
    nuevaReserva.codigoConfirmacion = codigo;

    await nuevaReserva.save();

    //TWILIO
    const mensaje = `Hola! ${datosReserva.nomCliente}. Confirma tu reserva en el local: ${datosReserva.nombre} para ${datosReserva.cantPersonas} persona(s) el ${datosReserva.fechaReserva} desde ${datosReserva.horaEntradaReserva} hasta ${datosReserva.horaSalidaReserva}. Usa el código para confirmar tu reserva: ${nuevaReserva.codigoConfirmacion}`;

    try {
      const message = await client.messages.create({
        from: 'whatsapp:+14155238886',  // Número del Sandbox de Twilio
        to: `whatsapp:+51${datosReserva.celCliente}`, // Número del cliente en formato E.164
        body: mensaje,                   // Mensaje con el código de confirmación
      });
      console.log(`Mensaje enviado con SID: ${message.sid}`);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error.message);
    }

    // Actualizar las reservas del local (opcional si llevas referencia)
    // local.reservas.push(nuevaReserva._id);
    // await local.save();

    res.status(201).json({ mensaje: 'Reserva creada con éxito', nuevaReserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al agregar la reserva' });
  }
};

