const jwt = require('jsonwebtoken');
const config = require('../configs/config');

const requireAuth = (req, res, next) => {
    try {
        const token = req.headers['access-token'];
        if (token) {
            jwt.verify(token, config.key, (err, authData) => {     
                if (err) {
                    return res.sendStatus(403).json({Message: 'Token invalido'});
                } else {
                    req.authData = authData;
                    next();
                }
            });
        } else {
            res.sendStatus(404).json({Message: 'No hay un token entregado'});
        }
    } catch (error) {
        return res.status(401).json({Message: "No autorizado"});
    }
};

module.exports = { requireAuth };