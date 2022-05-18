const { Router } = require("express");
const route = Router();
const othersController = require("../controllers/othersController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.get("/getDepartamentos", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    othersController.getDepartamentos(req, res)
  }
});

route.get("/getMunicipios/:id", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    othersController.getMunicipios(req, res)
  }
});

module.exports = route;
