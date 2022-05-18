const { Schema, model } = require("mongoose");

const municipiosSchema = new Schema(
  {
    Nombre: {
      type: String,
      required: true
    },
    _idDepartamento:[{
      type: Schema.Types.ObjectId,
      ref: 'departamento',
      required: true
    }]
  },
  { timestamps: true }
);

module.exports =  model("municipio", municipiosSchema);