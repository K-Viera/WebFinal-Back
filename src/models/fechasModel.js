const { Schema, model } = require('mongoose');

const fechasSchema = new Schema(
    {
        Fecha: {
            type: Date,
            required: true,
            unique:true
        },
        Activo: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

module.exports = model('fechas', fechasSchema);