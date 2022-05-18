const requestController = {};
const requestModel = require("../models/requestsModel");
const fechasModel = require("../models/fechasModel");
const ansModel = require("../models/ansModel");
const observacionesModel = require("../models/observacionesModel");
const moment = require("moment");

require("../models/municipiosModel");
require("../models/departamentosModel");
require("../models/ansModel");
require("../models/userModel");

const seguimientosModel = require("../models/seguimientosModel");

requestController.postRequest = async (req, res) => {
  let { user, role } = req.authData.user;

  if (role) {
    await requestModel
      .find({})
      .populate({
        path: "_idMunicipio",
        select: "Nombre _idDepartamento",
        populate: {
          path: "_idDepartamento",
          select: "Nombre",
        },
      })
      .populate({ path: "_idAns", select: "TipoCargo Dias" })
      .populate({ path: "_idUsuario", select: "Names LastNames" })
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
  } else {
    await requestModel
      .find({ User: user })
      .populate({ path: "_idMunicipio", select: "Nombre" })
      .populate({ path: "_idAns", select: "TipoCargo Dias" })
      .populate({ path: "_idUsuario", select: "Names LastNames" })
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
  }
};

requestController.postNewRequest = async (req, res) => {
  let { id } = req.authData.user;
  let fechaLimite = await calcularFechaLimite(req.body.ansId)
    .catch((err) => {
    res.status(400)
    .json(err);
  });
  const request = {
    Cargo: req.body.cargo,
    Fecha: Date.now(),
    FechaIndicador: Date.now(),
    Estado: req.body.estado,
    FechaLimite: fechaLimite,
    Linea: req.body.linea,
    Cantidad: req.body.cantidad,
    CanceladosEU: 0,
    _idMunicipio: req.body.municipio,
    _idCliente: req.body.cliente,
    _idAns: req.body.ansId,
    _idUsuario: id,
  };

  await new requestModel(request)
    .save()
    .then(() => {
      res.status(200).json({
        title: "Solicitud creada",
        icon: "success",
        text: "Solicitud creada con éxito",
      });
    })
    .catch((err) => {
      let message = ({ title, icon, text } = {
        title: "Ocurrió un error",
        icon: "error",
        text: "Ocurrió un error inesperado.\n" + err,
      });

      res.status(400).json(message);
    });
};

const calcularFechaLimite = async (ansId, dateOld) => {
  return new Promise(async (resolve, reject) => {
    let ans = await ansModel.findById(ansId).catch((err) => reject(err));

    if (ans != null) {
      if(dateOld == undefined){
        dateOld = moment(Date.now()).startOf("day");
      } else if (dateOld != undefined) {
        dateOld = moment.utc(dateOld, 'YYYY-MM-DD').startOf("day");
      }

      let fechasList = await fechasModel
        .find({
          $and: [
            { Fecha: { $gte: dateOld }},
            { Activo: { $eq: true }}
          ]

        })
        .sort({ Fecha: "asc" })
        .exec()
        .catch((err) => reject(err));
      let cont = 0;
      let finalDate = dateOld =! undefined ? new Date(dateOld) : new Date(moment(Date.now()).startOf("day"));

      while (cont < ans.Dias) {
        if (fechasList.length != 0) {
          if (fechasList[0].Fecha.getTime() == finalDate.getTime()) {
            fechasList.splice(0, 1);
          } else {
            cont++;
          }
          finalDate.setDate(finalDate.getDate() + 1);
        } else {
          let diasFaltantes = ans.Dias - cont;

          finalDate.setDate(finalDate.getDate() + diasFaltantes);
          cont = ans.Dias;
        }
      }

      resolve(finalDate);
    } else {
      reject("ans incompleto");
    }
  });
};

requestController.changeCantidad=async(req,res)=>{
  let { user } = req.authData.user;
  let { id, motivoCancelacion,cantidad, observacion } = req.body;

  if (id != null &&
    motivoCancelacion != null,
    cantidad != null,
    observacion != null){
    let request = await requestModel.findById(id)
    .catch((err) => {
      res.status(500).json(err)
    })
    if (request!=null){
      let arregloSeguimientos = await seguimientosModel.find({ _idRequest:request._id });
      let arregloCancelaciones = request.Cancelados;
      let cantidadActual = 0, reqCancelados = 0;

      arregloSeguimientos.forEach((seguimiento) => {
        let contratadosTemp = seguimiento.List.find(
          (el) => el.tipo == "contratados"
        );

        if (contratadosTemp != null) {
          cantidadActual += contratadosTemp.cantidad;
        }
      });

      arregloCancelaciones.forEach((cancelados) => {
        cantidadActual += cancelados.cantidad;
        reqCancelados += cancelados.cantidad;
      });

      if (cantidadActual <= request.Cantidad - cantidad){
        if (parseInt(cantidad) + reqCancelados === request.Cantidad){
          request.Estado = "Cancelado";
        } else if (parseInt(cantidad) + cantidadActual === request.Cantidad){
          request.Estado = "Finalizado";
        }

        await requestModel.findOneAndUpdate({_id: request.id},{
          $push: {
            Cancelados: [{
              "cantidad": parseInt(cantidad),
              "motivo": motivoCancelacion,
              "usuario": user,
              "fecha": moment(Date.now()).startOf("second").toDate()
            }]
          }
        })

        addObservacion(request._id, user, motivoCancelacion + ": " + cantidad + " Observacion : " + observacion)
        request.save()
        .then(() => {
          res.status(200)
          .json({
            title: "Solicitud modificada",
            icon: "success",
            text: "Cantidad cancelada con éxito"
          })
        })
      } else res.status(200).json({
        title: "Error en la cantidad",
        icon: "error",
        text: "Cantidad de contratados superior a la cantidad restada",
      })
    } else 
      res.status(400)
      .json("solicitud no encontrada")
  } else 
    res.status(400)
    .json("datos incompletos")
}

requestController.deleteRequest = async (req, res) => {
  let { user } = req.authData.user;
  let { id, motivoCancelacion, observacion } = req.body;

  if (id != null && motivoCancelacion != null && observacion != null) {
    let requestTemp = await requestModel
      .findById(id)
      .catch((err) => res.status(500).json(err));

    if (requestTemp != null) {
      requestTemp.Estado = "Cancelado";
      requestTemp.Observacion = motivoCancelacion;

      addObservacion(requestTemp._id, user, motivoCancelacion + ": " + observacion);
      requestTemp.save()
      .catch((err) => {
        res.status(500)
        .json(err)
      });
      res.status(200)
      .json("ok");
    } else 
      res.status(400)
      .json("solicitud no encontrada");
  } else 
    res.status(400)
    .json("datos incompletos");
};

const addObservacion = async (idRequest, user, observacion) => {
  return new Promise(async (resolve, reject) => {
    let fecha = moment(Date.now()).startOf("second").toDate();

    const validate = await observacionesModel
      .findOne({
        _idRequest: idRequest,
      })
      .catch((err) => reject(err));
    if (validate == null) {
      const newObservacion = new observacionesModel({ _idRequest: idRequest });

      newObservacion.List = [{ Usuario: user, Observacion: observacion, Fecha: fecha }];
      await newObservacion
        .save()
        .then(() => resolve())
        .catch((err) => reject(err));
    } else {

      validate.List.push({ Usuario: user, Observacion: observacion, Fecha: fecha });
      await validate.save()
        .then(() => resolve())
        .catch((err) => reject(err));
    }
  });
};

requestController.updateRequest = async (req, res) => {
  const putRequest = {
    Cargo: req.body.cargo,
    Estado: req.body.estado,
    Linea: req.body.linea,
    Cantidad: req.body.cantidad,
    _idMunicipio: req.body.municipio,
    _idAns: req.body.ansId,
    _idUsuario: req.body.responsable,
    Fecha: req.body.fecha ? new Date(req.body.fecha) : undefined,
    FechaIndicador: req.body.fechaIndicador ? new Date(req.body.fechaIndicador) : undefined
  };
  let contratados = await seguimientosModel
    .find({ _idRequest: req.body.id }, { List: 1 })
    .exec()
    .then((response) => {
      if (response.length != 0) {
        if (response[0].List.length > 0) {
          let contratadoTemp = response[0].List.find(
            (el) => el.tipo === "contratados"
          );
          return contratadoTemp.cantidad;
        }
      }else{
        return 0;
      }
    })
    .catch((err) => {
      res.status(400).json("Error:" + err);
    });

  if (contratados <= putRequest.Cantidad) {
    if (contratados === putRequest.Cantidad) {
      putRequest.Estado = "Finalizado";
    }
    let fechaLimite = await calcularFechaLimite(req.body.ansId, req.body.fecha)
    .catch((err) => {
      res.status(400).json(err);
    });

    if (fechaLimite != null) {
      putRequest.FechaLimite = fechaLimite;
    }

    await requestModel
      .updateOne({ _id: req.body.id }, putRequest)
      .then(() => {
        let message = ({ title, icon, text } = {
          title: "Solicitud editada",
          icon: "success",
          text: "Solicitud editada con éxito",
        });
        res.status(200).json(message);
      })
      .catch((err) => {
        let message = ({ title, icon, text } = {
          title: "Ocurrió un error",
          icon: "error",
          text: "Ocurrió un error inesperado.\n" + err,
        });
        res.status(400).json(message);
      });
  } else {
    let message = ({ title, icon, text } = {
      title: "Error al editar",
      icon: "error",
      text: "La cantidad de contratados no puede ser mayor a la solicitada",
    });
    res.status(400).json(message);
  }
};

requestController.getRequest = async (req, res) => {
  let id = req.query.id;

  await requestModel
    .findById(id)
    .populate({ path: "_idUsuario", select: "Names LastNames" })
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
    .then((obj) => {
      res.status(200).json(obj);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

requestController.getContratados = async (req, res) => {
  let id = req.query.id;

  if (id != null) {
    let arregloSeguimientos = await seguimientosModel
      .find({ _idRequest: id })
      .catch((err) => res.status(500).json(err));

    if (arregloSeguimientos != null) {
      listContratados = [];
      arregloSeguimientos.forEach((seguimiento) => {
        let temp = seguimiento.List.find((el) => el.tipo == "contratados");

        if (temp != null) {
          temp.inputList.forEach((element) => {
            listContratados.push({
              nombre: element.nombre,
              cedula: element.cedula,
              tipo: element.tipo,
              fechaInicio: element.fechaInicio,
              fechaFin: element.fechaFin,
              estado: element.estado,
            });
          });
        }
      });
      res.status(200).json(listContratados);
    } else res.status(400).json("datos no encontrados");
  } else res.status(400).json("datos incompletos");
};

module.exports = requestController;
