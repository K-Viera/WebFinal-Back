const inicioController = {};
const requestModel = require("../models/requestsModel");
require("../models/municipiosModel");
require("../models/departamentosModel");
require("../models/ansModel");
require("../models/userModel");

inicioController.getAllSolicitudes = async (req, res) => {
  let { user, role } = req.authData.user;

  if (role) {
    await requestModel
      .find({
        $or: [{ Estado: "Abierto" }, { Estado: "En Proceso" }],
      })
      .populate({
        path: "_idMunicipio",
        select: "Nombre _idDepartamento",
        populate: {
          path: "_idDepartamento",
          select: "Nombre",
        },
      })
      .populate("_idAns")
      .populate("_idCliente")
      .populate({ path: "_idUsuario", select: "Names LastNames" })
      .exec()
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    await requestModel
      .find({
        $and: [
          { $or: [{ Estado: "Abierto" }, { Estado: "En Proceso" }] },
          { _idUsuario: req.authData.user.id },
        ],
      })
      .populate({
        path: "_idMunicipio",
        select: "Nombre _idDepartamento",
        populate: {
          path: "_idDepartamento",
          select: "Nombre",
        },
      })
      .populate("_idAns")
      .populate("_idCliente")
      .exec()
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
};

inicioController.getAllSolicitudesClose = async (req, res) => {
  let { user, role } = req.authData.user;

  if (role) {
    await requestModel
      .aggregate([
        {
          $lookup: {
            from: "seguimientos",
            localField: "_id",
            foreignField: "_idRequest",
            as: "listaContratados",
          },
        },
        {
          $match: {
            listaContratados: {
              $elemMatch: {
                List: {
                  $elemMatch: {
                    tipo: "contratados",
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_idUsuario",
            foreignField: "_id",
            as: "usuario",
          },
        },
        {
          $lookup: {
            from: "ans",
            localField: "_idAns",
            foreignField: "_id",
            as: "ans",
          },
        },
        {
          $lookup: {
            from: "clientes",
            localField: "_idCliente",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $lookup: {
            from: "municipios",
            localField: "_idMunicipio",
            foreignField: "_id",
            as: "municipio",
          },
        },
        {
          $lookup: {
            from: "departamentos",
            localField: "municipio._idDepartamento",
            foreignField: "_id",
            as: "departamento",
          },
        },
        {
          $project: {
            _id: 1,
            Cantidad: 1,
            Cargo: 1,
            Estado: 1,
            Fecha: 1,
            FechaLimite: 1,
            FechaFinalizado: 1,
            Linea: 1,
            Cancelados: 1,
            "usuario.Names": 1,
            "usuario.LastNames": 1,
            "ans.Dias": 1,
            "ans.TipoCargo": 1,
            "cliente.Nombre": 1,
            "municipio.Nombre": 1,
            "departamento.Nombre": 1,
            listaContratados: 1,
            order: {
              $switch: {
                branches: [
                  { case: { $eq: ["$Estado", "Abierto"] }, then: 1 },
                  { case: { $eq: ["$Estado", "En Proceso"] }, then: 2 },
                  { case: { $eq: ["$Estado", "Finalizado"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
      ])
      .sort({
        order: 1,
      })
      .exec()
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    await requestModel
      .aggregate([
        {
          $lookup: {
            from: "seguimientos",
            localField: "_id",
            foreignField: "_idRequest",
            as: "listaContratados",
          },
        },
        {
          $match: {
            listaContratados: {
              $elemMatch: {
                List: {
                  $elemMatch: {
                    tipo: "contratados",
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_idUsuario",
            foreignField: "_id",
            as: "usuario",
          },
        },
        {
          $match: {
            usuario: {
              $elemMatch: {
                User: user,
              },
            },
          },
        },
        {
          $lookup: {
            from: "ans",
            localField: "_idAns",
            foreignField: "_id",
            as: "ans",
          },
        },
        {
          $lookup: {
            from: "clientes",
            localField: "_idCliente",
            foreignField: "_id",
            as: "cliente",
          },
        },
        {
          $lookup: {
            from: "municipios",
            localField: "_idMunicipio",
            foreignField: "_id",
            as: "municipio",
          },
        },
        {
          $lookup: {
            from: "departamentos",
            localField: "municipio._idDepartamento",
            foreignField: "_id",
            as: "departamento",
          },
        },
        {
          $project: {
            _id: 1,
            Cantidad: 1,
            Cargo: 1,
            Estado: 1,
            Fecha: 1,
            FechaLimite: 1,
            FechaFinalizado: 1,
            Linea: 1,
            Cancelados: 1,
            "usuario.Names": 1,
            "usuario.LastNames": 1,
            "ans.Dias": 1,
            "ans.TipoCargo": 1,
            "cliente.Nombre": 1,
            "municipio.Nombre": 1,
            "departamento.Nombre": 1,
            listaContratados: 1,
            order: {
              $switch: {
                branches: [
                  { case: { $eq: ["$Estado", "Abierto"] }, then: 1 },
                  { case: { $eq: ["$Estado", "En Proceso"] }, then: 2 },
                  { case: { $eq: ["$Estado", "Finalizado"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
      ])
      .sort({
        order: 1,
      })
      .exec()
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
};

inicioController.getAllSolicitudesCancel = async (req, res) => {
  let { user, role } = req.authData.user;

  if (role) {
    await requestModel
      .find({
        Cancelados: { $exists: true },
      })
      .populate({
        path: "_idMunicipio",
        select: "Nombre _idDepartamento",
        populate: {
          path: "_idDepartamento",
          select: "Nombre",
        },
      })
      .populate("_idAns")
      .populate("_idCliente")
      .populate({ path: "_idUsuario", select: "Names LastNames" })
      .exec()
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    await requestModel
      .find({
        Cancelados: { $exists: true },
      })
      .populate({
        path: "_idMunicipio",
        select: "Nombre _idDepartamento",
        populate: {
          path: "_idDepartamento",
          select: "Nombre",
        },
      })
      .populate("_idAns")
      .populate("_idCliente")
      .exec()
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
};

module.exports = inicioController;
