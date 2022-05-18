const mongoose = require("mongoose");
const mongouri =
  // "mongodb://localhost:27017/mision";
  "mongodb+srv://admin:admin@clustermision.bvsr0.mongodb.net/mision?retryWrites=true&w=majority";
mongoose
  .connect(mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("conected to mongoDb"))
  .catch((error) => console.log(error));

module.exports = mongoose;
