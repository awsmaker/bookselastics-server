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
exports.searchBooks = void 0;
const book_1 = __importDefault(require("@/models/book"));
const helper_1 = require("@/utils/helper");
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.query;
    if (typeof title !== "string" || (title === null || title === void 0 ? void 0 : title.trim().length) < 3)
        return (0, helper_1.sendErrorResponse)({
            message: "Invalid search query!",
            res,
            status: 422,
        });
    const results = yield book_1.default.find({
        title: { $regex: title, $options: "i" },
    });
    res.json({ results: results.map(helper_1.formatBook) });
});
exports.searchBooks = searchBooks;
