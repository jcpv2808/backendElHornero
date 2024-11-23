const express = require("express");
const router = express.Router();
const reservasController = require("../controllers/reservaController.js");

// Ruta para crear una nueva reserva
router.post("/nueva", reservasController.nuevaReserva);

// Ruta para listar todas las reservas
router.get("/listar", reservasController.listarReservas);

// Ruta para listar reservas por fecha
router.post("/listar/fecha", reservasController.listarReservasFecha);

// Ruta para listar reservas por hora de un local específico
router.post("/listar/porhora", reservasController.listarReservasPorHora);

// Ruta para listar mesas disponibles de un local en una hora específica
router.post("/listar/mesas", reservasController.listarMesasDisponibles);

// Ruta para verificar codigo de reserva
router.post("/verificarCodigo", reservasController.verificarCodigo);

module.exports = router;
