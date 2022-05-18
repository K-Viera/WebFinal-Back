const { Schema, model } = require('mongoose');

const seguimientosHistorySchema = new Schema(
    {
        Fecha: {
            type: Date,
            default: Date.now
        },
        Tipo: {
            type: String,
            required: true
        },
        Cantidad: {
            type: Number,
            required: true
        },
        _idSeguimiento: {
            type: Schema.Types.ObjectId,
            ref: 'seguimiento',
            required: true
        }
    },
    { timestamps: true }
);

model.exports = model('seguimientosHistory', seguimientosHistorySchema);