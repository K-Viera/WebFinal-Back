const { Router } = require("express");
const route = Router();
const requestController = require("../controllers/requestController");
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

route.post("/postRequest", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController
      .postRequest(req, res)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

route.post("/postNewRequest", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController.postNewRequest(req, res);
  }
});

route.delete("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController.deleteRequest(req, res);
  }
});

route.put("/cantidad", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController.changeCantidad(req, res);
  }
});

route.put("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController.updateRequest(req, res);
  }
});

route.get("/", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(res.statusCode).json({ message: res.Message });
  } else {
    requestController.getRequest(req, res);
  }
});

route.get("/contratados", requireAuth, (req, res) => {
  if (res.statusCode === 403) {
    res.status(403).json({ message: res.Message });
  } else {
    requestController.getContratados(req, res);
  }
});

module.exports = route;
