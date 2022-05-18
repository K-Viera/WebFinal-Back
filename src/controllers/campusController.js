const campusController = {};
const campusModel = require("../models/campusModel");
const userModel = require("../models/userModel");
const { query } = require("express");

campusController.getAll = async (req, res) => {
  await campusModel
    .find({}).sort( { Status: -1 } )
    .exec()
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      err.status(500).json({
        message: {
          title: "Error",
          icon: "error",
          text: err.message,
        },
      });
    });
};

campusController.updateCampus = async (req, res) => {
  const id = req.body.id;

  let campus = await campusModel
    .findById(id)
    .catch((err) => res.status(500).json(err));
  if (campus != null) {
    campus.Name = req.body.Nombre;
    await campus
      .save()
      .then(() => {
        res.status(200)
        .json(
          (message = {
            title: "Sede Editada",
            icon: "success",
            text: "Sede editada con éxito",
          })
        );
      })
      .catch((err) => res.status(400).json(err));
  } else {
    res.status(400).json("sede no encontrado");
  }
};

campusController.postCampus = async (req, res) => {
  let { role } = req.authData.user;

  if (role) {
    const campus = new campusModel({
      Name: req.body.Nombre,
      Status: req.body.Status,
    });
    await campus
      .save()
      .then(() => {
        res.json(
          (message = {
            title: "Sede Creada",
            icon: "success",
            text: "Sede creada con éxito",
          })
        );
      })
      .catch((err) => {
        res.status(500).json({
          message: {
            title: "Error",
            icon: "error",
            text: err.message,
          },
        });
      });
  } else {
    res.status(403).json({
      message: {
        title: "Error",
        icon: "error",
        text: "No tienes permisos para realizar esta acción",
      },
    });
  }
};

campusController.deleteCampus = async (req, res) => {
  let { id } = req.body;

  if (id != null) {
    let user = await userModel
      .find({ _idSede: { $eq: id } })
      .catch((err) => res.status(500).json(err));
    if (user != null && user.length != 0) {
      let campus = await campusModel
        .findById(id)
        .catch((err) => res.status(500).json(err));
      if (campus != null) {
        campus.Status ? campus.Status = false : campus.Status = true;
        campus
          .save()
          .then(() =>
            res.status(200).json({
              title: campus.Status ? "Activada" : "Desactivada",
              icon: "success",
              text: "Sede " + (campus.Status ? "Activada" : "Desactivada") + " correctamente",
            })
          )
          .catch((err) => res.status(500).json(err));
      } else res.status(400).json("Sede incorrecta");
    } else {
      await campusModel
        .deleteOne({ _id: id })
        .then(() =>
          res.status(200).json({
            title: "Sede Eliminada",
            icon: "success",
            text: "Eliminado",
          })
        )
        .catch((err) => res.status(500).json(err));
    }
  } else res.status(400).json("datos incompletos");
};

module.exports = campusController;
