const clientesController = {};
const clientesModel = require("../models/clientesModel");
const tiposCargosModel = require("../models/ansModel");
const requestModel = require("../models/requestsModel");
const { query } = require("express");

clientesController.getAll = async (req, res) => {
  await clientesModel
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

clientesController.putAns = async (req, res) => {
  let { ansList, id } = req.body;
  if (ansList != null && id != null) {
    listAns = [];
    ansList.forEach((ans) => {
      listAns.push(ans.value);
    });
    let cliente = await clientesModel.findById(id).catch((err) => {
      res.status(500).json(err);
    });
    if (cliente != null) {
      cliente._idAns = listAns;
      await cliente
        .save()
        .then(() =>
          res.status(200).json({
            title: "Cliente modificado",
            icon: "success",
            text: "se agregaron los ANS al cliente correctamente",
          })
        )
        .catch((err) => {
          res.status(400).json(err);
        });
    } else res.status(200).json("Cliente no encontrado");
  } else res.status(200).json("datos incompletos");
};

clientesController.getAns = async (req, res) => {
  const id = req.query.id;
  if (id != null) {
    let ansList = [];
    let ansCliente = await clientesModel
      .findById(id)
      .populate("_idAns")
      .catch((err) => {
        res.status(500).json(err);
      });
    ansCliente._idAns.forEach((ans) => {
      ansList.push({
        value: ans._id,
        label: ans.TipoCargo,
      });
    });
    res.status(200).json(ansList);
  } else res.status(400).json("datos incompletos");
};

clientesController.updateCliente = async (req, res) => {
  const id = req.body.id;
  let cliente = await clientesModel
    .findById(id)
    .catch((err) => res.status(500).json(err));

  if (cliente != null) {
    cliente.Nombre = req.body.Nombre;
    await cliente
      .save()
      .then(() => res.status(200).json("ok"))
      .catch((err) => res.status(400).json(err));
  } else {
    res.status(400).json("cliente no encontrado");
  }
};

clientesController.postCliente = async (req, res) => {
  let { role } = req.authData.user;

  if (role) {
    const cliente = new clientesModel({
      Nombre: req.body.Nombre,
      Status: req.body.Status,
    });
    await cliente
      .save()
      .then(() => {
        res.json(
          (message = {
            title: "Cliente Creado",
            icon: "success",
            text: "Cliente creado con éxito",
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

clientesController.deleteCliente = async (req, res) => {
  let { id } = req.body;

  if (id != null) {
    let request = await requestModel
      .find({ _idCliente: { $eq: id } })
      .catch((err) => res.status(500).json(err));
    if (request != null && request.length != 0) {
      let cliente = await clientesModel
        .findById(id)
        .catch((err) => res.status(500).json(err));
console.log('cliente',cliente)
      if (cliente != null) {
        cliente.Status ? cliente.Status = false : cliente.Status = true;
        cliente
          .save()
          .then(() =>
            res.status(200).json({
              title: cliente.Status ? "Activad@" : "Desactivad@",
              icon: "success",
              text: "Cliente " + (cliente.Status ? "Activado" : "Desactivado") + " correctamente",
            })
          )
          .catch((err) => res.status(500).json(err));
      } else res.status(400).json("Cliente incorrecto");
    } else {
      await clientesModel
        .deleteOne({ _id: id })
        .then(() =>
          res.status(200).json({
            title: "Cliente Eliminado",
            icon: "success",
            text: "Eliminado",
          })
        )
        .catch((err) => res.status(500).json(err));
    }
  } else res.status(400).json("datos incompletos");
};

clientesController.getTiposCargos = async (req, res) => {
  let idCliente = req.params.id;
  if (idCliente != null) {
    let cliente = await clientesModel
      .findById(idCliente)
      .populate("_idAns")
      .catch((err) => {
        res.status(500).json(err);
      });
      if(cliente!=null){
        res.status(200).json(cliente._idAns)
      }else res.status(400).json("cliente no encontrado")
  } else res.status(400).json("datos incompletos");
};

module.exports = clientesController;
