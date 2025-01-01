"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
        {
            id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Book", required: true },
            price: { type: Number, required: true },
            totalPrice: { type: Number, required: true },
            qty: { type: Number, required: true },
        },
    ],
    stripeCustomerId: String,
    paymentId: String,
    totalAmount: Number,
    paymentStatus: String,
    paymentErrorMessage: String,
}, { timestamps: true });
const OrderModel = (0, mongoose_1.model)("Order", schema);
exports.default = OrderModel;
