const { Router } = require("express");
const seguimientoController = require("../controllers/seguimientosController");
const route = Router();
const seguimientosController = require("../controllers/seguimientosController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.post("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    seguimientoController.addSeguimiento(req, res);
  }
});

route.put("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    seguimientoController.changeSeguimiento(req, res);
  }
});

route.get("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    seguimientoController.getSeguimientos(req, res);
  }
});

module.exports = route;
