const { Schema, model } = require('mongoose');

const observacionesSchema = new Schema(
    {
        List: [],
        _idRequest: {
            type: Schema.Types.ObjectId,
            ref: 'request',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('observacion', observacionesSchema);