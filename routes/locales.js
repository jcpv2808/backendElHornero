const express = require('express');
const router = express.Router();
const controller = require('../controllers/localController');

// Ruta para crear un nuevo local
router.post('/crearLocal', controller.crearLocal);

// Ruta para listar todos los locales
router.get('/listarLocales', controller.listarLocales);

// Ruta para listar los datos de un local específico
router.post('/listarDatosLocal', controller.listarDatosLocal); // Cambiar a GET

// Ruta para listar las reservas de un local en una hora específica
router.post('/listarReservasPorHora/reservas', controller.listarReservasPorHora); // Cambiar a GET

// Ruta para agregar una nueva reserva a un local
router.post('/local/agregarReserva', controller.agregarReserva); // Mejorar la semántica de la ruta

module.exports = router;
