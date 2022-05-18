const fechasController = {};
const fechasModel = require("../models/fechasModel");
const moment = require("moment");

fechasController.getFechas = async (req, res) => {
  let year = req.query.year;
  let month = req.query.month;
  console.log("entro");
  if (year != null && month != null) {
    let names = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    var startDate = new Date(year, month, 1);
    var endDate = moment(startDate).endOf("month").toDate();
    let fechasList = await fechasModel.find({
      Fecha: { $gte: startDate, $lt: endDate },
    });
    let returnList = [];
    while (startDate.getMonth() == month) {
      let fechaTemp = fechasList.find(
        (el) => el.Fecha.getTime() == startDate.getTime()
      );
      if (fechaTemp != null) {
        returnList.push({
          number: startDate.getDate(),
          date: names[startDate.getDay()],
          activo: fechaTemp.Activo,
        });
      } else {
        returnList.push({
          number: startDate.getDate(),
          date: names[startDate.getDay()],
          activo: false,
        });
      }
      startDate.setDate(startDate.getDate() + 1);
    }
    console.log("resultado",returnList)
    res.status(200).json(returnList);
  } else res.status(400).json("datos incompletos");
};

fechasController.changeState = async (req, res) => {
  let fecha = req.body.fecha;
  console.log("fecha",fecha)

  if (fecha != null) {
    fecha = moment(fecha).startOf("day").toDate();
    console.log("fecha not null",fecha)
    let fechaTemp = await fechasModel
      .findOne({ Fecha: fecha })
      .catch((err) => res.status(400).json(err));
    if (fechaTemp != null) {
      console.log('fecha temp',fechaTemp)
      fechaTemp.Activo = !fechaTemp.Activo;
      fechaTemp
        .save()
        .then((response) => {
          res.status(200).json({
            message: "Estado modificado correctamente",
            number: response.Fecha.getDate(),
            activo: response.Activo,
          });
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } else {
      let newFecha = await new fechasModel({ Fecha: fecha });
      console.log('new fecha',newFecha)
      newFecha
        .save()
        .then((response) => {
          res.status(200).json({
            message: "Estado modificado correctamente",
            number: response.Fecha.getDate(),
            activo: response.Activo,
          });
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    }
  } else res.status(400).json("fecha no encontrada");
};

module.exports = fechasController;
