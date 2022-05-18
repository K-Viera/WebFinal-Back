const { Schema, model } = require('mongoose');

const ansSchema = new Schema(
    {
        TipoCargo: {
            type: String,
            required: true
        },
        Dias: {
            type: Number,
            required: true
        },
        Estado: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('ans', ansSchema);