"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    book: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Book",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
const ReviewModel = (0, mongoose_1.model)("Review", reviewSchema);
exports.default = ReviewModel;
