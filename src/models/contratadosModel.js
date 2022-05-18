const { Schema, model } = require('mongoose');

const contratadosSchema = new Schema (
    {
        Nombre: {
            type: String,
            required: true
        },
        fecha: {
            type: Date,
            required: true
        },
        _idRequest: [{
            type: Schema.Types.ObjectId,
            ref: 'request',
            required: true
        }],
    },
    { timestamps: true }
);

model.exports = model('contratado', contratadosSchema);