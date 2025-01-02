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
exports.instantCheckout = exports.checkout = void 0;
const book_1 = __importDefault(require("../models/book"));
const cart_1 = __importDefault(require("../models/cart"));
const order_1 = __importDefault(require("../models/order"));
const stripe_local_1 = __importDefault(require("../stripe-local"));
const helper_1 = require("../utils/helper");
const mongoose_1 = require("mongoose");
const generateStripeCheckoutSession = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield stripe_local_1.default.customers.create(options.customer);
    const session = yield stripe_local_1.default.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        success_url: process.env.PAYMENT_SUCCESS_URL,
        cancel_url: process.env.PAYMENT_CANCEL_URL,
        line_items: options.line_items,
        customer: customer.id,
    });
    return session;
});
const checkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId } = req.body;
    if (!(0, mongoose_1.isValidObjectId)(cartId)) {
        return (0, helper_1.sendErrorResponse)({ res, message: "Invalid cart id!", status: 401 });
    }
    const cart = yield cart_1.default.findOne({
        _id: cartId,
        userId: req.user.id,
    }).populate({
        path: "items.product",
    });
    if (!cart) {
        return (0, helper_1.sendErrorResponse)({ res, message: "Cart not found!", status: 404 });
    }
    let invalidPurchase = false;
    for (let cartItem of cart.items) {
        if (cartItem.product.status === "unpublished") {
            invalidPurchase = true;
            break;
        }
    }
    if (invalidPurchase) {
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Sorry some of the books in your cart is no longer for sale!",
            status: 403,
        });
    }
    const newOrder = yield order_1.default.create({
        userId: req.user.id,
        orderItems: cart.items.map(({ product, quantity }) => {
            return {
                id: product._id,
                price: product.price.sale,
                qty: quantity,
                totalPrice: product.price.sale * quantity,
            };
        }),
    });
    const customer = {
        name: req.user.name,
        email: req.user.email,
        metadata: {
            userId: req.user.id,
            orderId: newOrder._id.toString(),
            type: "checkout",
        },
    };
    const line_items = cart.items.map(({ product, quantity }) => {
        const images = product.cover
            ? { images: [(0, helper_1.sanitizeUrl)(product.cover.url)] }
            : {};
        return {
            quantity,
            price_data: {
                currency: "usd",
                unit_amount: product.price.sale,
                product_data: Object.assign({ name: product.title }, images),
            },
        };
    });
    const session = yield generateStripeCheckoutSession({ customer, line_items });
    if (session.url) {
        res.json({ checkoutUrl: session.url });
    }
    else {
        (0, helper_1.sendErrorResponse)({
            res,
            message: "Something went wrong, could not handle payment!",
            status: 500,
        });
    }
});
exports.checkout = checkout;
const instantCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    if (!(0, mongoose_1.isValidObjectId)(productId)) {
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Invalid product id!",
            status: 401,
        });
    }
    const product = yield book_1.default.findById(productId);
    if (!product) {
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Product not found!",
            status: 404,
        });
    }
    if (product.status === "unpublished") {
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Sorry this book is no longer for sale!",
            status: 403,
        });
    }
    const newOrder = yield order_1.default.create({
        userId: req.user.id,
        orderItems: [
            {
                id: product._id,
                price: product.price.sale,
                qty: 1,
                totalPrice: product.price.sale,
            },
        ],
    });
    const customer = {
        name: req.user.name,
        email: req.user.email,
        metadata: {
            userId: req.user.id,
            type: "instant-checkout",
            orderId: newOrder._id.toString(),
        },
    };
    const images = product.cover
        ? { images: [(0, helper_1.sanitizeUrl)(product.cover.url)] }
        : {};
    const line_items = [
        {
            quantity: 1,
            price_data: {
                currency: "usd",
                unit_amount: product.price.sale,
                product_data: Object.assign({ name: product.title }, images),
            },
        },
    ];
    const session = yield generateStripeCheckoutSession({ customer, line_items });
    if (session.url) {
        res.json({ checkoutUrl: session.url });
    }
    else {
        (0, helper_1.sendErrorResponse)({
            res,
            message: "Something went wrong, could not handle payment!",
            status: 500,
        });
    }
});
exports.instantCheckout = instantCheckout;
