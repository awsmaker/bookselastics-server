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
exports.getOrderSuccessStatus = exports.getOrderStatus = exports.getOrders = void 0;
const order_1 = __importDefault(require("../models/order"));
const user_1 = __importDefault(require("../models/user"));
const stripe_local_1 = __importDefault(require("../stripe-local"));
const helper_1 = require("../utils/helper");
const mongoose_1 = require("mongoose");
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_1.default.find({
        userId: req.user.id,
    })
        .populate("orderItems.id")
        .sort("-createdAt");
    res.json({
        orders: orders.map((item) => {
            return {
                id: item._id,
                stripeCustomerId: item.stripeCustomerId,
                paymentId: item.paymentId,
                totalAmount: item.totalAmount
                    ? (item.totalAmount / 100).toFixed(2)
                    : "0",
                paymentStatus: item.paymentStatus,
                date: item.createdAt,
                orderItem: item.orderItems.map(({ id: book, price, qty, totalPrice }) => {
                    var _a;
                    return {
                        id: book._id,
                        title: book.title,
                        slug: book.slug,
                        cover: (_a = book.cover) === null || _a === void 0 ? void 0 : _a.url,
                        qty,
                        price: (price / 100).toFixed(2),
                        totalPrice: (totalPrice / 100).toFixed(2),
                    };
                }),
            };
        }),
    });
});
exports.getOrders = getOrders;
const getOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    let status = false;
    if (!(0, mongoose_1.isValidObjectId)(bookId))
        return res.json({ status });
    const user = yield user_1.default.findOne({ _id: req.user.id, books: bookId });
    if (user)
        status = true;
    res.json({ status });
});
exports.getOrderStatus = getOrderStatus;
const getOrderSuccessStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.body;
    if (typeof sessionId !== "string")
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Invalid session id!",
            status: 400,
        });
    const session = yield stripe_local_1.default.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer;
    let customer;
    if (typeof customerId === "string") {
        customer = (yield stripe_local_1.default.customers.retrieve(customerId));
        const { orderId } = customer.metadata;
        const order = yield order_1.default.findById(orderId).populate("orderItems.id");
        if (!order)
            return (0, helper_1.sendErrorResponse)({
                message: "Order not found!",
                status: 404,
                res,
            });
        const data = order.orderItems.map(({ id: book, price, totalPrice, qty }) => {
            var _a;
            return {
                id: book._id,
                title: book.title,
                slug: book.slug,
                cover: (_a = book.cover) === null || _a === void 0 ? void 0 : _a.url,
                price: (price / 100).toFixed(2),
                totalPrice: (totalPrice / 100).toFixed(2),
                qty,
            };
        });
        return res.json({
            orders: data,
            totalAmount: order.totalAmount
                ? (order.totalAmount / 100).toFixed()
                : "0",
        });
    }
    (0, helper_1.sendErrorResponse)({
        message: "Something went wrong order not found!",
        status: 500,
        res,
    });
});
exports.getOrderSuccessStatus = getOrderSuccessStatus;
