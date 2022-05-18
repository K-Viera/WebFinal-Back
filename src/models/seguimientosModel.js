const { Schema, model } = require('mongoose');

const seguimientosSchema = new Schema(
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

module.exports = model('seguimiento', seguimientosSchema);