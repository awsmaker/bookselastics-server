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
exports.clearCart = exports.getCart = exports.updateCart = void 0;
const cart_1 = __importDefault(require("@/models/cart"));
const helper_1 = require("@/utils/helper");
const updateCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { items } = req.body;
    let cart = yield cart_1.default.findOne({ userId: req.user.id });
    if (!cart) {
        cart = yield cart_1.default.create({ userId: req.user.id, items });
    }
    else {
        for (const item of items) {
            const oldProduct = cart.items.find(({ product }) => item.product === product.toString());
            if (oldProduct) {
                oldProduct.quantity += item.quantity;
                if (oldProduct.quantity <= 0) {
                    cart.items = cart.items.filter(({ product }) => oldProduct.product !== product);
                }
            }
            else {
                cart.items.push({
                    product: item.product,
                    quantity: item.quantity,
                });
            }
        }
        yield cart.save();
    }
    res.json({ cart: cart._id });
});
exports.updateCart = updateCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_1.default.findOne({ userId: req.user.id }).populate({
        path: "items.product",
        select: "title slug cover price",
    });
    if (!cart)
        return (0, helper_1.sendErrorResponse)({ res, message: "Cart not found!", status: 404 });
    res.json({
        cart: {
            id: cart._id,
            items: cart.items.map((item) => {
                var _a;
                return ({
                    quantity: item.quantity,
                    product: {
                        id: item.product._id,
                        title: item.product.title,
                        slug: item.product.slug,
                        cover: (_a = item.product.cover) === null || _a === void 0 ? void 0 : _a.url,
                        price: {
                            mrp: (item.product.price.mrp / 100).toFixed(2),
                            sale: (item.product.price.sale / 100).toFixed(2),
                        },
                    },
                });
            }),
        },
    });
});
exports.getCart = getCart;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield cart_1.default.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    res.json();
});
exports.clearCart = clearCart;
