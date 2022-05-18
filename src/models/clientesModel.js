const { Schema, model } = require('mongoose');

const clientesSchema = new Schema(
    {
        Nombre: {
            type: String,
            required: true
        },
        Status: {
            type: Boolean,
            default: true
        },
        FechaCreacion: {
            type: Date,
            default: Date.now
        },
        _idAns: [{
            type: Schema.Types.ObjectId,
            ref: 'ans',
        }]
    },
    { timestamps: true }
);

module.exports = model('clientes', clientesSchema);