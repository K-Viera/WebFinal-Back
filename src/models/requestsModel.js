const { Schema, model } = require('mongoose');

const requestSchema = new Schema(
    {
        Cargo: {
            type: String,
            required: true
        },
        Fecha: {
            type: Date,
            required: true
        },
        FechaIndicador: {
            type: Date,
            required: true
        },
        FechaLimite: {
            type: Date,
            required: true
        },
        FechaFinalizado: {
            type: Date,
        },
        Estado: {
            type: String,
            required: true
        },
        Linea: {
            type: String,
            required: true
        },
        Cantidad: {
            type: Number,
            required: true
        },
        Cancelados: {
            type: Array,
            default : [],
            required: false
        },
        PrimerSeguimiento: {
            type: Date,
            required: false
        },
        _idMunicipio: [{
            type: Schema.Types.ObjectId,
            ref: 'municipio',
            required: true
        }],
        _idCliente: {
            type: Schema.Types.ObjectId,
            ref: 'clientes',
            required: true
        },
        _idAns: {
            type: Schema.Types.ObjectId,
            ref: 'ans',
            required: true
        },
        _idUsuario: [{
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }]
    },
    { timestamps: true }
);

module.exports = model('request', requestSchema);