const seguimientoController = {};
const moment = require("moment");
const { Error } = require("mongoose");
const requestsModel = require("../models/requestsModel");
const seguimientosModel = require("../models/seguimientosModel");

seguimientoController.getSeguimientos = async (req, res) => {
  let _idRequest = req.query.idRequest;

  await validacionEstado(_idRequest)
  .catch((err) => {
    err.status(500).json({
      message: {
        title: "Ocurrió un error",
        icon: "error",
        text: err.message,
      },
    });
  });

  await seguimientosModel
    .find({ _idRequest })
    .then((obj) => {
      res.status(200).json(obj);
    })
    .catch((err) => {
      res.status(500).json({
        message: {
          title: "Ocurrió un error",
          icon: "error",
          text: err.message,
        },
      });
    });
};

let validacionEstado = async (idRequest) => {
  return new Promise(async (resolve, reject) => {
    let request = await requestsModel.findById(idRequest);
    if (request != null) {
      let cantidadRequest = request.Cantidad;
      let canceladosEU = request.CanceladosEU;
      let arregloSeguimientos = await seguimientosModel.find({
        _idRequest: idRequest,
      });
      let cantidadActual = 0;

      arregloSeguimientos.forEach((seguimiento) => {
        let temp = seguimiento.List.find((el) => el.tipo == "contratados");
        if (temp != null) {
          cantidadActual += temp.cantidad;
        }
      });
      
      cantidadActual += canceladosEU;

      if (cantidadRequest <= cantidadActual) {
        request.Estado = "Finalizado";
        request.FechaFinalizado = Date.now();
        request
          .save()
          .then(() => {
            resolve("cambio");
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve("no cambio");
      }
    } else {
      reject("request no encontrado");
    }
  });
};

seguimientoController.addSeguimiento = async (req, res) => {
  let { _idRequest, cantidad, fecha } = req.body;
  cantidad = Number(cantidad);

  if (cantidad != null && fecha != null && _idRequest != null) {
    if (cantidad > 0) {
      fecha = moment(fecha).startOf("day").toDate();
      const newSeguimiento = await new seguimientosModel({ _idRequest });

      newSeguimiento.List = [
        { tipo: "enviados", cantidad: cantidad, fecha: fecha },
      ];
       await newSeguimiento
        .save()
        .then(async () => {
          let request = await requestsModel.findById(_idRequest);

          request.Estado = "En Proceso";
          if (request.PrimerSeguimiento == undefined) {
            request.PrimerSeguimiento = fecha;            
          }
          await request
            .save()
            .then(() => {
              res.status(200).json({
                message: {
                  title: "Seguimiento agregado",
                  icon: "success",
                  text: "Seguimiento creado con éxito",
                },
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: {
                  title: "Ocurrió un error",
                  icon: "error",
                  text: err.message,
                },
              });
            });
        })
        .catch((err) => {
          res.status(500).json({
            message: {
              title: "Ocurrió un error",
              icon: "error",
              text: err.message,
            },
          });
        });
    } else {
      res.status(400).json({
        message: {
          title: "Ocurrió un error",
          icon: "error",
          text: "Digien un valor mayor a 0",
        },
      });
    }
  } else {
    res.status(400).json({
      message: {
        title: "Ocurrió un error",
        icon: "error",
        text: "Datos incompletos",
      },
    });
  }
};

seguimientoController.changeSeguimiento = async (req, res) => {
  let {
    _id,
    _idRequest,
    cantidad,
    fecha,
    tipo,
    inputs,
    desistenC,
    canceladosEU,
    desistenV,
    adicional,
    examenes,
    noAsistentes,
    asistentes,
    rechazadosEU,
    backup,
    requisitos
  } = req.body;
  if (cantidad != null && fecha != null && _id != null && tipo != null) {
    fecha = moment(fecha).startOf("day").toDate();
    let seguimientoTemp = await seguimientosModel.findById(_id);

    if (seguimientoTemp != null) {
      if (tipo == "asistieron") {
        if (
          asistentes != null &&
          noAsistentes != null &&
          rechazadosEU != null &&
          backup != null
        ) {
          await setAsistieron(
            seguimientoTemp,
            Number(cantidad),
            fecha,
            Number(asistentes),
            Number(noAsistentes),
            Number(rechazadosEU),
            Number(backup)
          )
            .then(() => {
              res.status(200).json({
                message: {
                  title: "Seguimiento agregado",
                  icon: "success",
                  text: "Seguimiento creado con éxito",
                },
              });
            })
            .catch((err) => res.status(400).json(err));
        } else res.status(400).json("datos incorrectos");
      } else if (tipo == "vinculados") {
        if (
          desistenV != null &&
          canceladosEU != null &&
          adicional != null &&
          examenes != null &&
          requisitos != null
        ) {
          await setVinculados(
            seguimientoTemp,
            Number(cantidad),
            fecha,
            Number(desistenV),
            Number(canceladosEU),
            Number(adicional),
            Number(examenes),
            Number(requisitos)
          )
            .then(() => {
              res.status(200).json({
                message: {
                  title: "Seguimiento agregado",
                  icon: "success",
                  text: "Seguimiento creado con éxito",
                },
              });
            })
            .catch((err) => res.status(400).json(err));
        } else res.status(400).json("datos incorrectos");
      } else if (tipo == "contratados") {
        if (inputs != null) {
          await setContratatos(
            seguimientoTemp,
            fecha,
            inputs,
            _idRequest
          ) 
            .then(async () => {
              let Estado = await validacionEstado(_idRequest)
              .catch((err) => {
                err.status(500).json({
                  message: {
                    title: "Ocurrió un error",
                    icon: "error",
                    text: err.message,
                  },
                });
              });
              let message;

              if(Estado === "cambio") {
                message = {
                  title: "Seguimiento finalizado",
                  icon: "success",
                  text: "Seguimiento finalizado con éxito",
                };
              } else {
                message = {
                  title: "Seguimiento agregado",
                  icon: "success",
                  text: "Seguimiento creado con éxito",
                };
              }
              res.status(200).json({
                message: message,
              });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        } else {
          res.status(400).json({
            message: {
              title: "Ocurrió un error",
              icon: "error",
              text: "Datos incompletos",
            },
          });
        }
      } else {
        res.status(400).json({
          message: {
            title: "Ocurrió un error",
            icon: "error",
            text: "Tipo de seguimiento incorrecto",
          },
        });
      }
    } else {
      res.status(400).json({
        message: {
          title: "Ocurrió un error",
          icon: "error",
          text: "Seguimiento no encontrado",
        },
      });
    }
  } else {
    res.status(400).json({
      message: {
        title: "Ocurrió un error",
        icon: "error",
        text: "Datos incompletos",
      },
    });
  }
};

let validacion = async (list, cantidad, fecha, tipoPrevio, tipoSiguiente) => {
  return new Promise(async (resolve, reject) => {
    let temp = list.find((el) => el.tipo == tipoPrevio);
    if (temp != null) {
      if (temp.fecha <= fecha) {
        if (temp.cantidad == cantidad) {
          if (tipoSiguiente != null) {
            let tempSiguiente = list.find((el) => el.tipo == tipoSiguiente);
            if (tempSiguiente != null) {
              if (fecha <= tempSiguiente.fecha) {
                if (cantidad == tempSiguiente.cantidad) {
                  resolve();
                } else reject("cantidad incorrecta");
              } else reject("fecha incorrecta");
            }
          }
          resolve();
        } else reject("cantidad incorrecta");
      } else reject("fecha incorrecta");
    } else reject("objeto no encontrado");
  });
};

let setAsistieron = async (
  seguimientoTemp,
  cantidad,
  fecha,
  asistentes,
  noAsistentes,
  rechazadosEU,
  backup,
) => {
  return new Promise(async (resolve, reject) => {
    await validacion(
      seguimientoTemp.List,
      cantidad + backup + rechazadosEU + noAsistentes,
      fecha,
      "enviados",
      "vinculados"
    )
      .then(async () => {
        let indexPrev = seguimientoTemp.List.findIndex(
          (el) => el.tipo == "asistieron"
        );
        if (indexPrev == -1) {
          seguimientoTemp.List.push({
            tipo: "asistieron",
            cantidad,
            fecha,
            noAsistentes,
            asistentes,
            rechazadosEU,
            backup
          });
          await seguimientoTemp
            .save()
            .then(() => resolve("ok"))
            .catch((err) => reject(err));
        } else {
          seguimientoTemp.List[indexPrev] = {
            ...seguimientoTemp.List[indexPrev],
            cantidad: cantidad,
            fecha: fecha,
          };
          await seguimientoTemp
            .save()
            .then((s) => {
              resolve("ok");
            })
            .catch((err) => reject(err));
        }
      })
      .catch((err) => reject(err));
  });
};

let setVinculados = async (
  seguimientoTemp,
  cantidad,
  fecha,
  desistenV,
  canceladosEU,
  adicional,
  examenes,
  requisitos
) => {
  return new Promise(async (resolve, reject) => {
    await validacion(
      seguimientoTemp.List,
      cantidad + desistenV + canceladosEU + adicional + examenes + requisitos,
      fecha,
      "asistieron",
      "contratados"
    )
      .then(async () => {
        let indexPrev = seguimientoTemp.List.findIndex(
          (el) => el.tipo == "vinculados"
        );
        if (indexPrev == -1) {
          seguimientoTemp.List.push({
            tipo: "vinculados",
            cantidad,
            fecha,
            desistenV: desistenV,
            canceladosEU: canceladosEU,
            adicional: adicional,
            examenes: examenes,
            requisitos: requisitos,
          });
          await seguimientoTemp
            .save()
            .then(() => resolve("ok"))
            .catch((err) => reject(err));
        } else {
          seguimientoTemp.List[indexPrev] = {
            ...seguimientoTemp.List[indexPrev],
            cantidad: cantidad,
            fecha: fecha,
            desistenV: desistenV,
            canceladosEU: canceladosEU,
            adicional: adicional,
            examenes: examenes,
            requisitos: requisitos,
          };
          await seguimientoTemp
            .save()
            .then(() => resolve("ok"))
            .catch((err) => reject(err));
        }
      })
      .catch((err) => reject(err));
  });
};

let setContratatos = async (
  seguimientoTemp,
  fecha,
  inputList,
  _idRequest
) => {
  return new Promise(async (resolve, reject) => {
    await validacion(
      seguimientoTemp.List,
      inputList.length,
      fecha,
      "vinculados"
    )
      .then(async () => {
        let requestTemp = await requestsModel.findById(_idRequest);
        let cantidadRequest = requestTemp.Cantidad;
        let arregloSeguimientos = await seguimientosModel.find({ _idRequest });
        let cantidadActual = 0;

        arregloSeguimientos.forEach((seguimiento) => {
          let contratadosTemp = seguimiento.List.find(
            (el) => el.tipo == "contratados"
          );

          if (contratadosTemp != null) {
            cantidadActual += contratadosTemp.cantidad;
          }
        });

        let indexPrev = seguimientoTemp.List.findIndex(
          (el) => el.tipo == "contratados"
        );

        if (indexPrev == -1) {
          if (cantidadRequest >= cantidadActual + inputList.length) {
            seguimientoTemp.List.push({
              tipo: "contratados",
              cantidad: inputList.length,
              fecha,
              inputList,
            });
            await seguimientoTemp
              .save()
              .then(async () => {
                  resolve("ok");
              })
              .catch((err) => {
                reject(err);
              });
          } else reject("cantidad incorrecta");
        } else {
          let contratadosActuales = [];

            contratadosActuales = seguimientoTemp.List[
              indexPrev
            ].inputList.find((el) => el.tipo == "contratados");

            let finalList = [];

          if (Array.isArray(contratadosActuales)) {
            finalList = [...contratadosActuales, ...inputList];
          } else {
            finalList = [contratadosActuales, ...inputList];
          }

          let cantidadAnterior = seguimientoTemp.List[indexPrev].cantidad;

          if (
            cantidadRequest >=
              cantidadActual - cantidadAnterior + inputList.length
          ) {
            seguimientoTemp.List[indexPrev] = {
              ...seguimientoTemp.List[indexPrev],
              tipo: "contratados",
              cantidad: inputList.length,
              inputList: finalList,
            };
            await seguimientoTemp
              .save()
              .then(async () => {
                resolve("ok");
              })
              .catch((err) => reject(err));
          } else reject("cantidad incorrecta");
        }
      })
      .catch((err) => reject(err));
  });
};

module.exports = seguimientoController;
