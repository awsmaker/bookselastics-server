"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const authorSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    about: {
        type: String,
        required: true,
        trim: true,
    },
    socialLinks: [String],
    books: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
}, {
    timestamps: true,
});
const AuthorModel = (0, mongoose_1.model)("Author", authorSchema);
exports.default = AuthorModel;
