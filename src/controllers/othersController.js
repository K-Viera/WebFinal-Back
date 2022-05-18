const otherController = {};
const departamentosModel = require('../models/departamentosModel');
const municipiosModel = require('../models/municipiosModel');

otherController.getDepartamentos = async (req, res) => {
    await departamentosModel.find({})
    .sort({Nombre: 1})
    .exec()
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500)
      .json({
        message: {
          title: "Error",
          icon: "error",
          text: err.message
          }
      });
    });
};


otherController.getMunicipios = async (req, res) => {
  await municipiosModel.find({_idDepartamento: {$eq: req.params.id}})
  .populate('_idDepartamento')
  .sort({Nombre: 1})
  .exec()
  .then((response) => {
    res.status(200).json(response);
  })
  .catch((err) => {
    res.status(500)
    .json({
      message: {
        title: "Error",
        icon: "error",
        text: err.message
        }
    });
  });
};

module.exports = otherController;