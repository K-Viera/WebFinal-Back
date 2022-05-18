const { Router } = require("express");
const route = Router();
const usersController = require("../controllers/usersController");
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
    usersController.postUser(req, res);
  }
});

route.put("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    usersController.updateUser(req, res);
  }
});

route.put("/resetPass", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    usersController.resetPass(req, res);
  }
});

route.get("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    usersController.getAll(req, res);
  }
});

route.delete("/", requireAuth, (req, res) => {
  if(res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    usersController.deleteUser(req,res)
  }
});

module.exports = route;
