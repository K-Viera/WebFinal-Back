const observacionesController = {};
const observacionesModel = require("../models/observacionesModel");
const moment = require("moment");

observacionesController.getAll = async (req, res) => {
  let _idRequest = req.query.idRequest;

  await observacionesModel
    .find({ _idRequest }, {_id: 1, _idRequest: 1, List: 1 })
    .then((obj) => {
      res.status(200)
      .json(obj);
    })
    .catch((err) => {
      err.status(500)
      .json({
        message: {
          title: "Error",
          icon: "error",
          text: err.message,
        },
      });
    });
};

observacionesController.postObservacion = async (req, res) => {
  let { user } = req.authData.user;
  let { _idRequest, Observacion, Fecha } = req.body;

  if (_idRequest != null) {
    const newObservacion = new observacionesModel({ _idRequest });
    newObservacion.List = [{ Usuario: user, Observacion: Observacion, Fecha: moment(Fecha).startOf('second').toDate()}];

    const validate = await observacionesModel.findOne({ _idRequest });

    if (validate == null) {
      await newObservacion
        .save()
        .then(() => {
          res.json(
            (message = {
              title: "Observación Creada",
              icon: "success",
              text: "Observación creada con éxito",
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
			validate.List.push({ Usuario: user, Observacion: Observacion, Fecha: moment(Fecha).startOf('second').toDate() });

			await observacionesModel.updateOne({ _idRequest: _idRequest}, {List: validate.List })
				.then(() => {
					res.json(
						(message = {
							title: "Observación Creada",
							icon: "success",
							text: "Observación creada con éxito",
						})
					);
				})
				.catch((err) => {
					res.status(500)
          .json({
						message: {
							title: "Error",
							icon: "error",
							text: err.message,
						},
					});
				});
		}
	} else {
		res.status(400).json("Informacion incompleta");
	}
};

observacionesController.updateObservacion = async (req, res) => {
  const id = req.body.id;
  let cliente = await observacionesModel.findById(id);
  if (cliente != null) {
    cliente.Nombre = req.body.Nombre;
    await cliente
      .save()
      .then(() => res.status(200).json("ok"))
      .catch((err) => res.status(400).json(err));
  } else {
    res.status(400).json("observación no encontrada");
  }
};

observacionesController.deleteObservacion = async (req, res) => {
  let { _id } = req.body;

  await observacionesModel
    .deleteOne({ $req: { _id } })
    .then(() => {
      let message = ({ title, icon, text } = {
        title: "Observación eliminada",
        icon: "success",
        text: "Observación eliminada con éxito",
      });
      res.json(message);
    })
    .catch((err) => {
      let message = ({ title, icon, text } = {
        title: "Error",
        icon: "error",
        text:
          "Ocurrió un error inesperado.\n" +
          res.status(400).json("Error:" + err),
      });
      res.json(message);
    });
};

module.exports = observacionesController;
