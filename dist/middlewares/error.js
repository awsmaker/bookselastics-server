"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const errorHandler = (error, req, res, next) => {
    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
};
exports.errorHandler = errorHandler;
