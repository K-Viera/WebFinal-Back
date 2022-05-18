const { Router } = require('express');
const route = Router();
const campusController = require('../controllers/campusController');
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
      campusController.postCampus(req, res);
    }
  });
  
  route.put("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      campusController.updateCampus(req, res);
    }
  });
  
  route.get("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      campusController.getAll(req, res);
    }
  });
 
  route.delete("/", requireAuth, (req, res) => {
    if(res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
      campusController.deleteCampus(req,res)
    }
  });

module.exports = route;