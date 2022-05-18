const indicadoresController = {};
const requestModel = require("../models/requestsModel");
const moment = require("moment");
const cli = require("nodemon/lib/cli");

indicadoresController.getIncadoresM = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        [
          {
            '$lookup': {
              'from': 'seguimientos', 
              'localField': '_id', 
              'foreignField': '_idRequest', 
              'as': 'seguimientos'
            }
          }, {
            '$group': {
              '_id': {
                'anho': {
                  '$year': '$FechaIndicador'
                }, 
                'mes': {
                  '$month': '$FechaIndicador'
                }
              }, 
              'request': {
                '$push': {
                  '_id': '$_id', 
                  'fechaLimite': '$FechaLimite', 
                  'cantidad': '$Cantidad', 
                  'cancelados': '$Cancelados'
                }
              }, 
              'seguimientos': {
                '$push': {
                  '_id': '$seguimientos._idRequest', 
                  'List': '$seguimientos.List'
                }
              }, 
              'count': {
                '$sum': 1
              }
            }
          }, {
            '$project': {
              'request': 1, 
              'seguimientos': 1, 
              'count': 1
            }
          }
        ]
      ]
    )
    .sort({mes: 1})
    .exec()
    .then(async (response) => {
      let newRes = await calculateIndicadoresM(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
};

const calculateIndicadoresM = async (data) => {
  let contratados = 0, vinculadosAns = 0, canceladosCant = 0, cantidad = 0;
  let newObject = [];
  let tempObject = {};

  data.forEach(element => {
    tempObject.anho = element._id.anho;
    tempObject.mes = element._id.mes;

    if(element.seguimientos != undefined && element.seguimientos.length > 0){
      element.seguimientos.forEach( seguimiento => {
        if(seguimiento.List != undefined && seguimiento.List.length > 0){
          seguimiento.List.forEach( lista =>  {
            lista.forEach(tipo => {
              if(tipo.tipo === "contratados") {
                contratados += tipo.cantidad;
              }
              if(tipo.tipo === "enviados") {
                let fecha = element.request.find(ele => ele._id.equals(seguimiento._id[0]));
                if(tipo.fecha.getTime() <= fecha.fechaLimite.getTime()) {
                  vinculadosAns += tipo.cantidad;
                }
              }
            });
          })
        }
      })
    }
    if(element.request.length > 0) {
      element.request.forEach(request => {
        cantidad += request.cantidad;
        if(request.cancelados != undefined && request.cancelados.length > 0){
          request.cancelados.forEach(cancelado => {
            canceladosCant += cancelado.cantidad;
          })
        }
      });
    }
    tempObject.contratados = contratados;
    tempObject.vinculadosAns = vinculadosAns;
    tempObject.canceladosCant = canceladosCant;
    tempObject.solicitud = cantidad;

    newObject.push(tempObject);

    tempObject = {};
    
    contratados = 0, vinculadosAns = 0, canceladosCant = 0;
  });

  return newObject;
};

indicadoresController.getIncadoresMC = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        {
          $lookup: {
            from: 'clientes', 
            localField: '_idCliente', 
            foreignField: '_id', 
            as: 'cliente'
          }
        }, {
          $lookup: {
            from: 'seguimientos', 
            localField: '_id', 
            foreignField: '_idRequest', 
            as: 'listaContratados'
          }
        }, {
          $group: {
            _id: {
              month: {
                $month: '$FechaIndicador'
              }, 
              year: {
                $year: '$FechaIndicador'
              },
              cliente: '$_idCliente'
            },
            cliente:{
              $push: '$cliente'
            },
            request: {
              $push: {
                _id: '$_id',
                fechaLimite: '$FechaLimite',
              }
            },
            seguiminetos: {
              $push: '$listaContratados'
            }, 
            cancelados: {
              $push: '$Cancelados'
            }, 
            solicitud: {
              $sum: '$Cantidad'
            }, 
            count: {
              $sum: 1
            }, 
            date: {
              $first: '$FechaIndicador'
            }
          }
        }, {
          $project: {
            mes: {
              $convert: {
                input: {
                  $dateToString: {
                    format: '%m', 
                    date: '$date'
                  }
                }, 
                to: 'int'
              }
            }, 
            ano: {
              $convert: {
                input: {
                  $dateToString: {
                    format: '%Y', 
                    date: '$date'
                  }
                }, 
                to: 'int'
              }
            },
            cliente: 1,
            request: 1,
            seguiminetos: 1, 
            cancelados: 1, 
            solicitud: 1, 
            count: 1, 
            _id: 0
          }
        }
      ]
    )
    .sort({mes: 1})
    .exec()
    .then(async (response) => {
      let newRes = await calculateIndicadoresMC(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
};

const calculateIndicadoresMC = async (data) => {
  let contratados = 0, vinculadosAns = 0, canceladosCant = 0, i = 0;

  data.forEach(element => {
    element.seguiminetos.forEach(listCont => {
      if (listCont.length > 0) {
        listCont[0].List.forEach(cont => {
          if(cont.tipo === "contratados") {
            contratados += cont.cantidad;
          }
          if(cont.tipo === "enviados") {
            let fecha = element.request.find(ele => ele._id.equals(listCont[0]._idRequest));
            if(cont.fecha.getTime() <= fecha.fechaLimite.getTime()) {
              vinculadosAns += cont.cantidad;
            }
          }
        });
      }
    });
    if(element.cancelados.length > 0) {
      element.cancelados.forEach(cancel => {
        if(cancel[0] != undefined) {
          canceladosCant += cancel[0].cantidad;
        }
      });
    }
    data[i].clienteNom = element.cliente[0][0].Nombre;
    data[i].contratados = contratados;
    data[i].vinculadosAns = vinculadosAns;
    data[i].canceladosCant = canceladosCant;
    contratados = 0, vinculadosAns = 0, canceladosCant = 0;
    i += 1;
  });

  return data;
};

indicadoresController.getIncadoresS = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        {
          '$lookup': {
            'from': 'seguimientos', 
            'localField': '_id', 
            'foreignField': '_idRequest', 
            'as': 'seguimientos'
          }
        }, {
          '$group': {
            '_id': {
              'anho': {
                '$year': '$FechaIndicador'
              }, 
              'semana': {
                '$isoWeek': {
                  'date': '$FechaIndicador', 
                  'timezone': '-0500'
                }
              }
            }, 
            'request': {
              '$push': {
                '_id': '$_id', 
                'fechaLimite': '$FechaLimite', 
                'cantidad': '$Cantidad', 
                'cancelados': '$Cancelados'
              }
            }, 
            'seguimientos': {
              '$push': {
                '_id': '$seguimientos._idRequest', 
                'List': '$seguimientos.List'
              }
            }, 
            'count': {
              '$sum': 1
            }
          }
        }, {
          '$project': {
            'request': 1, 
            'seguimientos': 1, 
            'count': 1
          }
        }
      ]
    )
    .sort({semana: 1})
    .exec()
    .then(async (response) => {
      let newRes = await calculateIndicadoresS(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
};

const calculateIndicadoresS = async (data) => {
  let contratados = 0, vinculadosAns = 0, canceladosCant = 0, cantidad = 0;
  let newObject = [];
  let tempObject = {};

  data.forEach(element => {
    tempObject.anho = element._id.anho;
    tempObject.semana = element._id.semana;

    if(element.seguimientos != undefined && element.seguimientos.length > 0){
      element.seguimientos.forEach( seguimiento => {
        if(seguimiento.List != undefined && seguimiento.List.length > 0){
          seguimiento.List.forEach( lista =>  {
            lista.forEach(tipo => {
              if(tipo.tipo === "contratados") {
                contratados += tipo.cantidad;
              }
              if(tipo.tipo === "enviados") {
                let fecha = element.request.find(ele => ele._id.equals(seguimiento._id[0]));
                if(tipo.fecha.getTime() <= fecha.fechaLimite.getTime()) {
                  vinculadosAns += tipo.cantidad;
                }
              }
            });
          })
        }
      })
    }
    if(element.request.length > 0) {
      element.request.forEach(request => {
        cantidad += request.cantidad;
        if(request.cancelados != undefined && request.cancelados.length > 0){
          request.cancelados.forEach(cancelado => {
            canceladosCant += cancelado.cantidad;
          })
        }
      });
    }
    tempObject.contratados = contratados;
    tempObject.vinculadosAns = vinculadosAns;
    tempObject.canceladosCant = canceladosCant;
    tempObject.solicitud = cantidad;

    newObject.push(tempObject);

    tempObject = {};
    
    contratados = 0, vinculadosAns = 0, canceladosCant = 0;
  });

  return newObject;
};

indicadoresController.getIncadoresMS = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        {
          '$group': {
            '_id': {
              'anho': {
                '$year': '$FechaIndicador'
              }, 
              'mes': {
                '$month': '$FechaIndicador'
              }, 
              'semana': {
                '$week': '$FechaIndicador'
              }
            }, 
            'semana': {
              '$push': {
                'id': '$_id', 
                'semana': {
                  '$week': '$FechaIndicador'
                }
              }
            }, 
            'cantidad': {
              '$sum': '$Cantidad'
            }, 
            'cancelados': {
              '$push': '$Cancelados'
            }, 
            'request': {
              '$push': {
                'id': '$_id',
                'fechaIndicador': '$FechaIndicador',
                'fechaLimite': '$FechaLimite'
              }
            }
          }
        }, {
          '$lookup': {
            'from': 'seguimientos', 
            'localField': 'request.id', 
            'foreignField': '_idRequest', 
            'as': 'seguimientos'
          }
        }, {
          '$project': {
            '_id': 1, 
            'seguimientos': 1,
            'request': 1, 
            'cantidad': 1, 
            'cancelados': 1
          }
        }
      ]
    )
    .sort({
      anho: 1,
      mes: 1,
      semana: 1
    })
    .exec()
    .then(async (response) => {
      let newRes = await calculateIndicadoresMS(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
}

const calculateIndicadoresMS = async (data) => {
  let contratados = 0, vinculadosAns = 0, canceladosCant = 0, cantidad = 0;
  let newObject = [];
  let tempObject = {};

  data.forEach(element => {
    tempObject.anho = element._id.anho;
    tempObject.mes = element._id.mes;
    tempObject.semana = element._id.semana;

    if(element.seguimientos != undefined && element.seguimientos.length > 0){
      let seguimientoNew = Object.values(element.seguimientos);

      seguimientoNew.forEach( seguimiento => {
        if(seguimiento.List != undefined && seguimiento.List.length > 0){
          seguimiento.List.forEach( lista =>  {
              if(lista.tipo === "contratados") {
                contratados += lista.cantidad;
              }
              if(lista.tipo === "enviados") {
                let requestNew = Object.values(element.request);
                let fecha = requestNew.find(ele => ele.id.equals(seguimiento._idRequest));

                if(lista.fecha.getTime() <= fecha.fechaLimite.getTime()) {
                  vinculadosAns += lista.cantidad;
                }
              }
          })
        }
      })
    }

    if(element.cancelados != undefined && element.cancelados.length > 0){
      let canceladosNew = Object.entries(element.seguimientos);

      canceladosNew.forEach(cancelado => {
        canceladosCant += cancelado.cantidad;
      })
    }

    tempObject.contratados = contratados;
    tempObject.vinculadosAns = vinculadosAns;
    tempObject.canceladosCant = canceladosCant;
    tempObject.solicitud = element.cantidad;

    newObject.push(tempObject);

    tempObject = {};
    
    contratados = 0, vinculadosAns = 0, canceladosCant = 0;
  });

  return newObject;
};

indicadoresController.getEstadosMes = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        {
          '$lookup': {
            'from': 'clientes', 
            'localField': '_idCliente', 
            'foreignField': '_id', 
            'as': 'cliente'
          }
        }, {
          '$lookup': {
            'from': 'seguimientos', 
            'localField': '_id', 
            'foreignField': '_idRequest', 
            'as': 'seguimientos'
          }
        }, {
          '$group': {
            '_id': {
              'anho': {
                '$year': '$FechaIndicador'
              },
              'mes': {
                '$month': '$FechaIndicador'
              },
              'semana': {
                '$isoWeek': {
                  'date': '$FechaIndicador', 
                  'timezone': '-0500'
                }
              }
            }, 
            'request': {
              '$push': {
                '_id': '$_id', 
                'estado': '$Estado',
                'fechaLimite': '$FechaLimite', 
                'cantidad': '$Cantidad', 
                'cancelados': '$Cancelados', 
                '_idCliente': {
                  '$arrayElemAt': [
                    '$cliente._id', 0
                  ]
                }, 
                'cliente': {
                  '$arrayElemAt': [
                    '$cliente.Nombre', 0
                  ]
                }, 
                'list': '$seguimientos.List'
              }
            }, 
            'count': {
              '$sum': 1
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'request': 1, 
            'count': 1
          }
        }
      ]
    )
    .sort({
      anho: 1,
      mes: 1,
      semana: 1
    })
    .exec()
    .then(async (response) => {
      let newRes = await calculateEstadosMes(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
};

const calculateEstadosMes = async (data) => {
  let seleccion = 0, vinculados = 0, cliente = 0, cantidad = 0;
  let posAnho = undefined, posMes = undefined, posSemana = undefined, posClient = undefined;
  let newObject = [];
  
  if (data.length > 0) {
    data.map(element => {
      if (element.request.length > 0){
        element.request.map(req => {
          if (req.estado === "Abierto" || req.estado === "En Proceso") {
            cantidad += 1;

            if (newObject.length === 0) {
              newObject.push({anho: element._id.anho});
              posAnho = newObject.findIndex(ele => ele.anho === element._id.anho);
      
              Object.assign(newObject[posAnho], {meses: [{mes: element._id.mes}]});
              posMes = newObject[posAnho].meses.findIndex(ele => ele.mes === element._id.mes);
      
              Object.assign(newObject[posAnho].meses[posMes], {semanas: [{semana: element._id.semana}]});
              posSemana = newObject[posAnho].meses[posMes].semanas.findIndex(ele => ele.semana === element._id.semana);
            } else {
              posAnho = newObject.findIndex(ele => ele.anho === element._id.anho);
              if (posAnho == -1) {
                newObject.push({anho: element._id.anho});
                posAnho = newObject.findIndex(ele => ele.anho === element._id.anho);
              }
      
              posMes = newObject[posAnho].meses.findIndex(ele => ele.mes === element._id.mes);
              if (posMes == -1) {
                newObject[posAnho].meses.push({mes: element._id.mes});
                posMes = newObject[posAnho].meses.findIndex(ele => ele.mes === element._id.mes);
              }
      
              posSemana = newObject[posAnho].meses[posMes].semanas.findIndex(ele => ele.semana === element._id.semana);
              if (posSemana == -1) {
                newObject[posAnho].meses[posMes].semanas.push({semana: element._id.semana});
                posSemana = newObject[posAnho].meses[posMes].semanas.findIndex(ele => ele.semana === element._id.semana);
              }
            }

            posClient = newObject[posAnho].meses[posMes].semanas[posSemana].clientes;
            if (posClient === undefined) {
              Object.assign(newObject[posAnho].meses[posMes].semanas[posSemana], {clientes: [{_idCliente: req._idCliente, nombre: req.cliente, requerimientos: 0, vinculacion: 0, seleccion: 0, cliente: 0}]});
            }
            posClient = newObject[posAnho].meses[posMes].semanas[posSemana].clientes.findIndex(ele => ele._idCliente === req._idCliente);

            if (posClient === -1) {
              newObject[posAnho].meses[posMes].semanas[posSemana].clientes.push({_idCliente: req._idCliente, nombre: req.cliente, requerimientos: 0, vinculacion: 0, seleccion: 0, cliente: 0});
              posClient = newObject[posAnho].meses[posMes].semanas[posSemana].clientes.findIndex(ele => ele._idCliente === req._idCliente);
            }

            let tempCantidad = newObject[posAnho].meses[posMes].semanas[posSemana].cantidad;
            if (tempCantidad === undefined) {
              newObject[posAnho].meses[posMes].semanas[posSemana].cantidad = 1;
            } else {
              newObject[posAnho].meses[posMes].semanas[posSemana].cantidad += 1;
            }
            
            if (req.list.length > 0) {
              if (req.estado === "Abierto" || req.estado === "En Proceso") {
                newObject[posAnho].meses[posMes].semanas[posSemana].clientes[posClient].requerimientos += 1;
              }
              req.list[0].map(list => {
                if (list.tipo === "vinculados" && (req.estado === "Abierto" || req.estado === "En Proceso")) {
                  newObject[posAnho].meses[posMes].semanas[posSemana].clientes[posClient].vinculacion += 1;
                  vinculados += 1;
                }
                if (list.tipo === "contratados" && (req.estado === "Abierto" || req.estado === "En Proceso")) {
                  newObject[posAnho].meses[posMes].semanas[posSemana].clientes[posClient].seleccion += req.cantidad - list.cantidad;
                  seleccion += req.cantidad - list.cantidad;
                }
                if (list.tipo === "enviados" && (req.estado === "Abierto" || req.estado === "En Proceso")) {
                  newObject[posAnho].meses[posMes].semanas[posSemana].clientes[posClient].cliente += 1;
                  cliente += 1;
                }
              });
            }
          }
        });
      }
    });
  }

  return newObject;
};

indicadoresController.getEstadosSemana = async (req, res) => {
  try {
    await requestModel.aggregate(
      [
        {
          '$lookup': {
            'from': 'clientes', 
            'localField': '_idCliente', 
            'foreignField': '_id', 
            'as': 'cliente'
          }
        }, {
          '$lookup': {
            'from': 'seguimientos', 
            'localField': '_id', 
            'foreignField': '_idRequest', 
            'as': 'seguimientos'
          }
        }, {
          '$group': {
            '_id': {
              'anho': {
                '$year': '$FechaIndicador'
              },
              'mes': {
                '$month': '$FechaIndicador'
              },
              'semana': {
                '$isoWeek': {
                  'date': '$FechaIndicador', 
                  'timezone': '-0500'
                }
              }
            }, 
            'request': {
              '$push': {
                '_id': '$_id', 
                'fechaLimite': '$FechaLimite', 
                'cantidad': '$Cantidad', 
                'cancelados': '$Cancelados', 
                '_idCliente': {
                  '$arrayElemAt': [
                    '$cliente._id', 0
                  ]
                }, 
                'cliente': {
                  '$arrayElemAt': [
                    '$cliente.Nombre', 0
                  ]
                }, 
                'list': '$seguimientos.List'
              }
            }, 
            'count': {
              '$sum': 1
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'request': 1, 
            'count': 1
          }
        }
      ]
    )
    .sort({
      anho: 1,
      mes: 1,
      semana: 1
    })
    .exec()
    .then(async (response) => {
      let newRes = await calculateIndicadoresMS(response);
      return res.json(newRes);
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
  } catch (err) {
    res.status(500).json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message,
      },
    });
  }
}

const calculateEstadosSemana = async (data) => {
  let contratados = 0, vinculadosAns = 0, canceladosCant = 0, cantidad = 0;
  let newObject = [];
  let tempObject = {};

  data.forEach(element => {
    tempObject.anho = element._id.anho;
    tempObject.mes = element._id.mes;
    tempObject.semana = element._id.semana;

    if(element.seguimientos != undefined && element.seguimientos.length > 0){
      let seguimientoNew = Object.values(element.seguimientos);

      seguimientoNew.forEach( seguimiento => {
        if(seguimiento.List != undefined && seguimiento.List.length > 0){
          seguimiento.List.forEach( lista =>  {
              if(lista.tipo === "contratados") {
                contratados += lista.cantidad;
              }
              if(lista.tipo === "enviados") {
                let requestNew = Object.values(element.request);
                let fecha = requestNew.find(ele => ele.id.equals(seguimiento._idRequest));

                if(lista.fecha.getTime() <= fecha.fechaLimite.getTime()) {
                  vinculadosAns += lista.cantidad;
                }
              }
          })
        }
      })
    }

    if(element.cancelados != undefined && element.cancelados.length > 0){
      let canceladosNew = Object.entries(element.seguimientos);

      canceladosNew.forEach(cancelado => {
        canceladosCant += cancelado.cantidad;
      })
    }

    tempObject.contratados = contratados;
    tempObject.vinculadosAns = vinculadosAns;
    tempObject.canceladosCant = canceladosCant;
    tempObject.solicitud = element.cantidad;

    newObject.push(tempObject);

    tempObject = {};
    
    contratados = 0, vinculadosAns = 0, canceladosCant = 0;
  });

  return newObject;
};


module.exports = indicadoresController;