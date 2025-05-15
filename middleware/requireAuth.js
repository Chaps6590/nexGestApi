"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No Autorizado" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No Autorizado" });
    }
    jsonwebtoken_1.default.verify(token, 'secret', (err, user) => {
        if (err) {
            return res.status(401).json({ message: "No Autorizado" });
        }
        if (!user) {
            return res.status(401).json({ message: "No Autorizado" });
        }
        if (typeof user === 'object' && user !== null) {
            req.user = user;
        }
        else {
            return res.status(401).json({ message: "No Autorizado" });
        }
        next();
    });
};
exports.requireAuth = requireAuth;
