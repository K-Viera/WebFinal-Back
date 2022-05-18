const downloadController = {};
let nodeXlsx = require("node-xlsx");
const requestModel = require("../models/requestsModel");
const seguimientosModel = require("../models/seguimientosModel");
const observacionesModel = require("../models/observacionesModel");

const arrHeaderRequestTitle = [
  "IdSolicitud",
  "Cliente",
  "Cargo",
  "Fecha Inicial",
  "Fecha Indicador",
  "Fecha Limite",
  "Fecha Final",
  "ANS",
  "Estado",
  "Linea",
  "Cantidad",
  "Cancelado EU",
  "Responsable",
  "Departamente",
  "Ciudad"
];

const arrHeaderSeguimientoTitle = [
  "IdSolicitud",
  "IdSeguimiento",
  "Fecha Enviados",
  "Enviados",
  "Fecha Asisten",
  "Asisten",
  "No Asisten",
  "Seleccionados",
  "Rechazados EU",
  "Backup",
  "Fecha Vinculados",
  "Vinculados",
  "Desisten V",
  "Cancelados EU",
  "No Adicional",
  "No Examenes",
  "No Requisitos",
  "Fecha Contratados",
  "Contratados"
];

const arrHeaderContratadosTitle = [
  "idSolicitud",
  "idSeguimiento",
  "Cedula",
  "Nombre"
];

const arrHeaderObservacionesTitle = [
  "idSolicitud",
  "idObservacion",
  "Fecha",
  "Observacion",
  "Usuario"
];

downloadController.download = async (req, res) => {
  let { beginDate, finishDate } = req.body;
  beginDate = new Date(beginDate);
  finishDate = new Date(finishDate);

  let requestList = await requestModel
    .find({
      Fecha: {
        $gte: beginDate.setHours(00, 00, 00),
        $lt: finishDate.setHours(23, 59, 59),
      },
    })
    .populate("_idUsuario")
    .populate({
      path: "_idMunicipio",
      select: "Nombre _idDepartamento",
      populate: {
        path: "_idDepartamento",
        select: "Nombre"
      },
    })
    .populate({
      path: "_idAns",
      select: "Dias"
    })
    .populate({
      path: "_idCliente",
      select: "Nombre"
    })
    .catch((err) => res.status(500).json(err));

  await processRequest(requestList).then((respuesta)=>{
    let buffer = nodeXlsx.build([
      { name: "Solicitudes", data: respuesta.requests },
      { name: "Seguimientos", data: respuesta.seguimientos },
      { name: "Contratados", data: respuesta.contratados },
      { name: "Observaciones", data: respuesta.observaciones },
    ]);
    res.attachment("Solicitudes-Range.xlsx");
    res.send(buffer);
  }).catch((err) =>
    res.status(400).json(err)
  );
};

const processRequest = async (requestList) => {
  return new Promise(async (resolve, reject) => {
    let requestData = [];
    let seguimientosData = [];
    let contratadosData = [];
    let observacionesData = [];

    requestData.push(arrHeaderRequestTitle);
    seguimientosData = [arrHeaderSeguimientoTitle];
    contratadosData = [arrHeaderContratadosTitle];
    observacionesData = [arrHeaderObservacionesTitle];

    if (requestList != null) {
      await requestList.forEach(async (request) => {
        requestData.push(requestToArray(request));
        let dataSeguimientos = await processSeguimientos(request.id)
        .catch(
          (err) => {
            console.log(err);
            reject(err);
          }
        );

        seguimientosData.push.apply(seguimientosData, dataSeguimientos.seguimientos);

        contratadosData.push.apply(contratadosData, dataSeguimientos.contratados);

        observacionesProcess = await processObservaciones(request._id)
        .catch(
          (err) => {
            console.log(err);
            reject(err);
          }
        );

        observacionesData.push.apply(observacionesData, observacionesProcess);

        resolve({
          requests: requestData,
          seguimientos: seguimientosData,
          contratados: contratadosData,
          observaciones: observacionesData,
        });
      });
    } else {
      reject("Datos no encontrados");
    }
  });
};

const processObservaciones = async (requestId) => {
  return new Promise(async (resolve, reject) => {
    let arrayObservaciones = [];
    let observacionesList = await observacionesModel
      .find({ _idRequest: requestId })
      .catch((err) => reject(err));

    observacionesList.forEach((observacion) => {
      observacion.List.forEach((message) => {
        arrayObservaciones.push([
          requestId,
          observacion._id,
          message.Fecha,
          message.Observacion,
          message.Usuario
        ]);
      });
    });
    resolve(arrayObservaciones);
  });
};

const processSeguimientos = async (requestId) => {
  return new Promise(async (resolve, reject) => {
    let seguimientosList = await seguimientosModel
      .find({ _idRequest: requestId })
      .catch((err) => reject(err));
    let arraySeguimientos = [];
    let arrayContratados = [];

    await seguimientosList.forEach(async (seguimiento) => {
      let arrayData = seguimientosToArray(seguimiento);
      arraySeguimientos.push(arrayData.array);

      if (arrayData.existenContratados) {
        let contratados = seguimiento.List.find(
          (el) => el.tipo == "contratados"
        );

        contratados.inputList.forEach((contratado) => {
          arrayContratados.push([
            requestId,
            seguimiento._id,
            contratado.cedula,
            contratado.nombre
          ]);
        });
      }
    });
    resolve({ seguimientos: arraySeguimientos, contratados: arrayContratados });
  });
};

const requestToArray = (request) => {
  let array = [
    request._id,
    request._idCliente.Nombre,
    request.Cargo,
    request.Fecha,
    request.FechaIndicador,
    request.FechaLimite,
    request.FechaFinalizado,
    request._idAns.Dias,
    request.Estado,
    request.Linea,
    request.Cantidad,
    request.CanceladosEU,
    request._idUsuario[0].Names + " " + request._idUsuario[0].LastNames,
    request._idMunicipio[0]._idDepartamento[0].Nombre,
    request._idMunicipio[0].Nombre,
  ];
  return array;
};

const seguimientosToArray = (seguimiento) => {
  let array = [seguimiento._idRequest.toString(), seguimiento._id.toString()];
  let existenContratados = false;
  let enviados = seguimiento.List.find((el) => el.tipo == "enviados");

  if (enviados != null) {
    array = [...array, enviados.fecha, enviados.cantidad];
    let asistieron = seguimiento.List.find((el) => el.tipo == "asistieron");

    if (asistieron != null) {
      array = [
        ...array,
        asistieron.fecha,
        asistieron.asistentes,
        asistieron.noAsistentes,
        asistieron.cantidad,
        asistieron.rechazadosEU,
        asistieron.backup
      ];
      let vinculados = seguimiento.List.find((el) => el.tipo == "vinculados");

      if (vinculados != null) {
        array = [
          ...array,
          vinculados.fecha,
          vinculados.cantidad,
          vinculados.desistenV,
          vinculados.canceladosEU,
          vinculados.adicional,
          vinculados.examenes,
          vinculados.requisitos
        ];
        let contratados = seguimiento.List.find(
          (el) => el.tipo == "contratados"
        );

        if (contratados != null) {
          if (contratados.cantidad != 0) existenContratados = true;
          array = [
            ...array,
            contratados.fecha,
            contratados.cantidad
          ];
        }
      }
    }
  }
  return { array: array, existenContratados };
};

module.exports = downloadController;
