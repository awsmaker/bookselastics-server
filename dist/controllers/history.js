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
exports.getBookHistory = exports.updateBookHistory = void 0;
const history_1 = __importDefault(require("../models/history"));
const helper_1 = require("../utils/helper");
const mongoose_1 = require("mongoose");
const updateBookHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId, highlights, lastLocation, remove } = req.body;
    let history = yield history_1.default.findOne({
        book: bookId,
        reader: req.user.id,
    });
    if (!history) {
        history = new history_1.default({
            reader: req.user.id,
            book: bookId,
            lastLocation,
            highlights,
        });
    }
    else {
        if (lastLocation)
            history.lastLocation = lastLocation;
        if ((highlights === null || highlights === void 0 ? void 0 : highlights.length) && !remove)
            history.highlights.push(...highlights);
        if ((highlights === null || highlights === void 0 ? void 0 : highlights.length) && remove) {
            history.highlights = history.highlights.filter((item) => !highlights.find((h) => h.selection === item.selection));
        }
    }
    yield history.save();
    res.send();
});
exports.updateBookHistory = updateBookHistory;
const getBookHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(bookId))
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Invalid book id!",
            status: 422,
        });
    const history = yield history_1.default.findOne({
        book: bookId,
        reader: req.user.id,
    });
    if (!history)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Not Found!",
            status: 404,
        });
    res.json({
        history: {
            lastLocation: history.lastLocation,
            highlights: history.highlights.map((h) => ({
                fill: h.fill,
                selection: h.selection,
            })),
        },
    });
});
exports.getBookHistory = getBookHistory;
