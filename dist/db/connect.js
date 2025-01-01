"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uri = process.env.MONGO_URI;
if (!uri)
    throw new Error("Database uri is missing!");
const dbConnect = () => {
    mongoose_1.default
        .connect(uri)
        .then(() => {
        console.log("db connected!");
    })
        .catch((error) => {
        console.log("db connection failed: ", error.message);
    });
};
exports.dbConnect = dbConnect;
