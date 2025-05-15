"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = exports.profileHandler = exports.loginHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validar campos
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Buscar usuario por email
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Comparar contraseñas
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Generar token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        console.log("token", token);
        return res.json({
            message: "Login successful",
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginHandler = loginHandler;
const profileHandler = (req, res) => {
    return res.json({
        profile: {
            data: req.user,
        },
        message: "Profile successful"
    });
};
exports.profileHandler = profileHandler;
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validar datos básicos
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Revisar si el usuario ya existe
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }
        // Encriptar contraseña
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Crear usuario
        const user = new user_1.default({
            name,
            email,
            password: hashedPassword,
        });
        yield user.save();
        // Generar token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(201).json({ token });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.registerHandler = registerHandler;
