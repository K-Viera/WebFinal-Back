const loginController = {};
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const config = require("../configs/config");
const Swal = "sweetalert2";

loginController.postCloseLogin = async (req, res) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¡Se cerrará la sesión!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "¡Sí, cerrar sesión!",
  }).then((result) => {
    if (result.value) {
      req.session.destroy();
      res.redirect("/");
    }
  });
  // localStorage.removeItem("token");
  // localStorage.removeItem("user");
  // res.json({
  //   response: 200,
  //   message: {
  //     title: "Cerrando sesión",
  //     icon: "success",
  //     text: "Sesión cerrada",
  //   },
  // });
};

loginController.postLogin = async(req,res) => {
  let { user, password } = req.body;

  await userModel.find({
    $and: [
      {User: { $eq: user}},
      {Password: { $eq: password}}
    ]
  })
  .exec()
  .then((response) => {
    const newResponse = JSON.parse(JSON.stringify(response));
    if(response === undefined || response.length === 0){
      res.json({
        response: 404,
        message: {
          title: "Error",
          icon: "error",
          text:
            "Usuario o contraseña incorrectos",
          },
      });
    }else if (newResponse[0].Status) {
      jwt.sign({ user: {id: newResponse[0]._id, user: newResponse[0].User, role: newResponse[0].Rol} }, config.key, { expiresIn: "1440m" }, (err, token) => {
        if(err){
          res.json({
            response: 404,
            message: {
              title: "Ocurrió un error",
              icon: "error",
              text: err,
            },
          });
        }else{
          res.header('access-token')
          .json({
            response: 200,
            token: token,
            names: newResponse[0].Names,
            lastNames: newResponse[0].LastNames,
            user: newResponse[0].User,
            rol: newResponse[0].Rol,
          });
        }
      });
    }
  })
  .catch((err) => {
    reject(err);
  });
};

module.exports = loginController;
