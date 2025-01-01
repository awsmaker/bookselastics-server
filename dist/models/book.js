"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    language: {
        type: String,
        required: true,
        trim: true,
    },
    publicationName: {
        type: String,
        required: true,
        trim: true,
    },
    averageRating: Number,
    genre: {
        type: String,
        required: true,
        trim: true,
    },
    publishedAt: {
        type: Date,
        required: true,
    },
    copySold: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["published", "unpublished"],
        default: "published",
    },
    price: {
        type: Object,
        required: true,
        mrp: {
            type: Number,
            required: true,
        },
        sale: {
            type: Number,
            required: true,
        },
    },
    cover: {
        url: String,
        id: String,
    },
    fileInfo: {
        type: Object,
        required: true,
        url: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
});
bookSchema.pre("save", function (next) {
    const { mrp, sale } = this.price;
    this.price = { mrp: mrp * 100, sale: sale * 100 };
    next();
});
const BookModel = (0, mongoose_1.model)("Book", bookSchema);
exports.default = BookModel;
