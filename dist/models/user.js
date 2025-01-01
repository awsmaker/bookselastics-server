"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["user", "author"],
        default: "user",
    },
    signedUp: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: Object,
        url: String,
        id: String,
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Author",
    },
    books: [
        {
            type: mongoose_1.Schema.ObjectId,
            ref: "Book",
        },
    ],
    orders: [
        {
            type: mongoose_1.Schema.ObjectId,
            ref: "Order",
        },
    ],
});
const UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
