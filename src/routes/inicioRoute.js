const { Router } = require("express");
const route = Router();
const inicioController = require("../controllers/inicioController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.get("/getRequest", requireAuth, (req, res) => {

  if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      inicioController.getAllSolicitudes(req,res)
    }
});

route.get("/getRequestClose", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      inicioController.getAllSolicitudesClose(req,res)
    }
});

route.get("/getRequestCancel", requireAuth, (req, res) => {
  console.log('entro a cancel');
  if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      inicioController.getAllSolicitudesCancel(req,res)
    }
});

module.exports = route;