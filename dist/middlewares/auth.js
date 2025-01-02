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
exports.isValidReadingRequest = exports.isAuthor = exports.isPurchasedByTheUser = exports.isAuth = void 0;
const book_1 = __importDefault(require("../models/book"));
const user_1 = __importDefault(require("../models/user"));
const helper_1 = require("../utils/helper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.cookies.authToken;
    if (!authToken) {
        return (0, helper_1.sendErrorResponse)({
            message: "Unauthorized request!",
            status: 401,
            res,
        });
    }
    const payload = jsonwebtoken_1.default.verify(authToken, process.env.JWT_SECRET);
    const user = yield user_1.default.findById(payload.userId);
    if (!user) {
        return (0, helper_1.sendErrorResponse)({
            message: "Unauthorized request user not found!",
            status: 401,
            res,
        });
    }
    req.user = (0, helper_1.formatUserProfile)(user);
    next();
});
exports.isAuth = isAuth;
const isPurchasedByTheUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({
        _id: req.user.id,
        books: req.body.bookId,
    });
    if (!user)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Sorry we didn't found the book inside your library!",
            status: 403,
        });
    next();
});
exports.isPurchasedByTheUser = isPurchasedByTheUser;
const isAuthor = (req, res, next) => {
    if (req.user.role === "author")
        next();
    else
        (0, helper_1.sendErrorResponse)({ message: "Invalid request!", res, status: 401 });
};
exports.isAuthor = isAuthor;
const isValidReadingRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    const regex = new RegExp("/([^/?]+.epub)");
    const regexMatch = url.match(regex);
    if (!regexMatch)
        return (0, helper_1.sendErrorResponse)({ res, message: "Invalid request!", status: 403 });
    const bookFileId = regexMatch[1];
    const book = yield book_1.default.findOne({ "fileInfo.id": bookFileId });
    if (!book)
        return (0, helper_1.sendErrorResponse)({ res, message: "Invalid request!", status: 403 });
    const user = yield user_1.default.findOne({ _id: req.user.id, books: book._id });
    if (!user)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Unauthorized request!",
            status: 403,
        });
    next();
});
exports.isValidReadingRequest = isValidReadingRequest;
