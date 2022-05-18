const { Router } = require("express");
const route = Router();
const loginController = require("../controllers/loginController");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.post("/", loginController.postLogin);
route.post("/closeLogin", loginController.postCloseLogin);

module.exports = route;
