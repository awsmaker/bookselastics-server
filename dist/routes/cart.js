"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cart_1 = require("../controllers/cart");
const auth_1 = require("../middlewares/auth");
const validator_1 = require("../middlewares/validator");
const express_1 = require("express");
const cartRouter = (0, express_1.Router)();
cartRouter.post("/", auth_1.isAuth, (0, validator_1.validate)(validator_1.cartItemsSchema), cart_1.updateCart);
cartRouter.get("/", auth_1.isAuth, cart_1.getCart);
cartRouter.post("/clear", auth_1.isAuth, cart_1.clearCart);
exports.default = cartRouter;
