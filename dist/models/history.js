"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const historySchema = new mongoose_1.Schema({
    book: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Book",
        required: true,
    },
    reader: {
        type: mongoose_1.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    lastLocation: String,
    highlights: [{ selection: String, fill: String }],
}, {
    timestamps: true,
});
const HistoryModel = (0, mongoose_1.model)("History", historySchema);
exports.default = HistoryModel;
