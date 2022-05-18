const { Schema, model } = require('mongoose');

const departamentosSchema = new Schema(
    {
        Nombre: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('departamento', departamentosSchema);