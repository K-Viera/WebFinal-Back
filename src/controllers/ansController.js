const ansController = {};
const ansModel = require("../models/ansModel");
const requestModel = require("../models/requestsModel");
require("../models/clientesModel");

ansController.getAll = async (req, res) => {
  await ansModel
    .find({})
    .sort( { Estado: -1 } )
    .exec()
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

ansController.updateAns = async (req, res) => {
  const id = req.body.id;
  let ans = await ansModel.findById(id);
  
  if (ans != null) {
    ans.TipoCargo = req.body.TipoCargo;
    ans.Dias = req.body.Dias;
    ans._idCliente = req.body._idCliente;
    await ans
      .save()
      .then(() => {
        res.status(200)
        .json(
          (message = {
            title: "Ans Editado",
            icon: "success",
            text: "Ans editado con éxito",
          })
        );
      })
      .catch((err) => res.status(400).json(err));
  } else {
    res.status(400).json("ans no encontrado");
  }
};

ansController.postAns = async (req, res) => {
  let { role } = req.authData.user;

  if (role) {
    const Ans = new ansModel({
      TipoCargo: req.body.TipoCargo,
      Dias: req.body.Dias,
      Estado: req.body.Estado,
    });
    await Ans.save()
      .then(() => {
        res.json(
          (message = {
            title: "Ans Creado",
            icon: "success",
            text: "Ans creado con éxito",
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

ansController.deleteAns = async (req, res) => {
  let { id } = req.body;
  if (id != null) {
    let request = await requestModel
      .find({ _idAns: { $eq: id } })
      .catch((err) => res.status(500).json(err));
    if (request != null && request.length != 0) {
      let ans = await ansModel
        .findById(id)
        .catch((err) => res.status(500).json(err));
      if (ans != null) {
          ans.Estado ? ans.Estado = false : ans.Estado = true;
          ans
            .save()
            .then(() =>
              res.status(200).json({
                title: ans.Estado ? "Activado" : "Desactivado",
                icon: "success",
                text: "ANS " + (ans.Estado ? "Activado" : "Desactivado") + " correctamente",
              })
            )
          .catch((err) => res.status(500).json(err));
      } else res.status(400).json("ans incorrecto");
    } else {
      await ansModel
        .deleteOne({ _id: id })
        .then(() =>
          res.status(200).json({
            title: "ANS Eliminado",
            icon: "success",
            text: "Eliminado",
          })
        )
        .catch((err) => res.status(500).json(err));
    }
  } else res.status(400).json("datos incompletos");
};

module.exports = ansController;
