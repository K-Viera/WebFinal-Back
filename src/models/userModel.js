const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    User: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true
    },
    Names: {
      type: String,
      required: true
    },
    LastNames: {
      type: String,
      required: true
    },
    Status: {
      type: Boolean,
      required: true
    },
    _idSede:[{
      type: Schema.Types.ObjectId,
      ref: 'sedes',
      required: true
    }],
    Rol: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = model("user", userSchema);