"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Book",
                required: true,
            },
            quantity: { type: Number, default: 1 },
        },
    ],
}, { timestamps: true });
const CartModel = (0, mongoose_1.model)("Cart", cartSchema);
exports.default = CartModel;
