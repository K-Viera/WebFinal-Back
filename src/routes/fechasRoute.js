const { Router } = require("express");
const route = Router();
const fechasController = require("../controllers/fechasController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.put("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    fechasController.changeState(req, res);
  }
});

route.get("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    fechasController.getFechas(req, res);
  }
});
module.exports = route;
