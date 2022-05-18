const { Router } = require('express');
const route = Router();
const ansController = require('../controllers/ansController');
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
      ansController.postAns(req, res);
    }
  });
  
  route.put("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      ansController.updateAns(req, res);
    }
  });
  
  route.get("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      ansController.getAll(req, res);
    }
  });
  
  route.delete("/", requireAuth, (req, res) => {
    if(res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      ansController.deleteAns(req,res)
    }
  });

module.exports = route;