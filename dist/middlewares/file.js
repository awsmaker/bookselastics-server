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
exports.fileParser = void 0;
const formidable_1 = __importDefault(require("formidable"));
const fileParser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const form = (0, formidable_1.default)();
    const [fields, files] = yield form.parse(req);
    if (!req.body)
        req.body = {};
    if (!req.files)
        req.files = {};
    for (const key in fields) {
        const filedValue = fields[key];
        if (filedValue)
            req.body[key] = filedValue[0];
    }
    for (const key in files) {
        const filedValue = files[key];
        if (filedValue) {
            if (filedValue.length > 1) {
                req.files[key] = filedValue;
            }
            else {
                req.files[key] = filedValue[0];
            }
        }
    }
    next();
});
exports.fileParser = fileParser;
