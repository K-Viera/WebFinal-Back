const { Router } = require('express');
const route = Router();
const clientesController = require('../controllers/clientesController');
const { requireAuth } = require("../middleware/authMiddleware");

route.all("/", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

  route.post("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.postCliente(req, res);
    }
  });
  
  route.put("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.updateCliente(req, res);
    }
  });
  
  route.get("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.getAll(req, res);
    }
  });

  route.put("/ans", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.putAns(req, res);
    }
  });
  route.get("/ansOptions", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.getAns(req, res);
    }
  });

  route.get("/getTiposCargos/:id", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.getTiposCargos(req, res);
    }
  });
  
  route.delete("/", requireAuth, (req, res) => {
    if(res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      clientesController.deleteCliente(req,res)
    }
  });

module.exports = route;