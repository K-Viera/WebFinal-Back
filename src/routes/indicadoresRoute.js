const { Router } = require("express");
const route = Router();
const indicadoresController = require("../controllers/indicadoresController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all('/', function (res, req, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.get('/Meses', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getIncadoresM(req, res);
  }
});

route.get('/MesesClientes', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getIncadoresMC(req, res);
  }
});

route.get('/MesesSemanas', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getIncadoresMS(req, res);
  }
});

route.get('/Semanas', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getIncadoresS(req, res);
  }
});

route.get('/EstadosSemana', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getEstadosSemana(req, res);
  }
});

route.get('/EstadosMes', requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    indicadoresController.getEstadosMes(req, res);
  }
});

module.exports = route;