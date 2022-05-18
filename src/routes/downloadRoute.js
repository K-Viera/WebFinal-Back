const { Router } = require("express");
const route = Router();
const { requireAuth } = require("../middleware/authMiddleware");
const downloadController =require("../controllers/downloadController")

route.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
route.post("/", requireAuth, (req, res) => {
    if (res.statusCode === 403) {
      res.status(res.statusCode).json({ message: res.Message });
    } else {
        downloadController.download(req, res);
    }
  });
module.exports = route;
