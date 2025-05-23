"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    roles: {
        admin: { type: Boolean, default: false },
        user: { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userSchema, "users");
