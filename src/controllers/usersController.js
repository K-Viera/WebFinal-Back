const usersController = {};
const userModel = require("../models/userModel");
const requestModel = require("../models/requestsModel");
require("../models/campusModel");

usersController.getAll = async (req, res) => {
  let { role } = req.authData.user;

  if (role) {
    await userModel
      .find({}, { _id: 1, User: 1, Names: 1, LastNames: 1, Status: 1, Rol: 1 })
      .sort( { Status: -1 } )
      .populate({
        path: "_idSede",
        select: "_idSede Name",
      })
      .exec()
      .then((response) => {
        res.json(response);
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

usersController.updateUser = async (req, res) => {
  let id = req.body.id;
  let user = await userModel.findById(id);

  if (user != null) {
    user.User = req.body.User;
    user.LastNames = req.body.LastNames;
    user.Names = req.body.Names;
    user.Rol = req.body.Role;
    user._idSede = req.body.Campus;

    await user
      .save()
      .then(() => {
        res.status(200).json(
          (message = {
            title: "Usuari@ editad@",
            icon: "success",
            text: "Usuari@ editad@ con éxito",
          })
        );
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
    res.status(400).json("usuario no encontrado");
  }
};

usersController.resetPass = async (req, res) => {
  let id = req.body.id;
  let user = await userModel.findById(id);

  if (user != null) {
    user.Password = req.body.Password;

    await user
      .save()
      .then(() => {
        res.status(200).json(
          (message = {
            title: "Contraseña Reseteada",
            icon: "success",
            text: "Contraseña Reseteada con éxito",
          })
        );
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
    res.status(400).json("usuario no encontrado");
  }
};

usersController.postUser = async (req, res) => {
  let { role } = req.authData.user;

  if (role) {
    const user = new userModel({
      _idSede: req.body.Campus,
      User: req.body.User.toLowerCase(),
      Names: req.body.Names.toUpperCase(),
      LastNames: req.body.LastNames.toUpperCase(),
      Status: req.body.Status,
      Password: req.body.Password,
      Rol: req.body.Role,
    });

    await user
      .save()
      .then(() => {
        res.json(
          (message = {
            title: "Usuario Creado",
            icon: "success",
            text: "Usuario cread@ con éxito",
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

usersController.deleteUser = async (req, res) => {
  let { id } = req.body;
  if (id != null) {
    let request = await requestModel
      .find({ _idUsuario: { $eq: id } })
      .catch((err) => res.status(500).json(err));
    if (request != null && request.length != 0) {
      let user = await userModel
        .findById(id)
        .catch((err) => res.status(500).json(err));
      if (user != null) {
        user.Status ? user.Status = false : user.Status = true;
        user
          .save()
          .then(() =>
            res.status(200).json({
              title: user.Status ? "Activad@" : "Desactivad@",
              icon: "success",
              text: "Sede " + (user.Status ? "Activad@" : "Desactivad@") + " correctamente",
            })
          )
          .catch((err) => res.status(500).json(err));
      } else res.status(400).json("usuari@ incorrecto");
    } else {
      await userModel
        .deleteOne({ _id: id })
        .then(() =>
          res.status(200).json({
              title: "Usuari@ Eliminad@",
              icon: "success",
              text: "Eliminado",
          })
        )
        .catch((err) => res.status(500).json(err));
    }
  } else res.status(400).json("datos incompletos");
};

module.exports = usersController;
