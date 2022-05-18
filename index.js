const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bodyparser = require("body-parser");
require("./src/database");

// Middlewares
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.set("port", 5000);

app.use(morgan("dev"));

app.use(cors({ origin: true }));

//Routers
app.use("/login", require("./src/routes/loginRoute"));
app.use("/inicio", require("./src/routes/inicioRoute"));
app.use("/request", require("./src/routes/requestRoute"));
app.use("/clientes", require("./src/routes/clientesRoute"));
app.use("/departamentos", require("./src/routes/othersRoute"));
app.use("/municipios", require("./src/routes/othersRoute"));
app.use("/seguimientos", require("./src/routes/seguimientosRoute"));
app.use("/users", require("./src/routes/usersRoute"));
app.use("/campus", require("./src/routes/campusRoute"));
app.use("/ans", require("./src/routes/ansRoute"));
app.use("/observaciones", require("./src/routes/observacionesRoute"));
app.use("/fechas", require("./src/routes/fechasRoute"));
app.use("/download",require("./src/routes/downloadRoute"))
app.use("/indicadores",require("./src/routes/indicadoresRoute"))

//start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Listen in the port ", port);
});

//protected routers
