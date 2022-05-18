const { Schema, model } = require('mongoose');

const sedesSchema = new Schema(
    {
        Nombre: {
            type: String,
            required: true
        },
        Estado: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
);

model.exports = model('sede', sedesSchema);
