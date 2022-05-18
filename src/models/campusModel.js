const { Schema, model } = require("mongoose");

const campusSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Status: {
      type: Boolean,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports =  model("sedes", campusSchema);