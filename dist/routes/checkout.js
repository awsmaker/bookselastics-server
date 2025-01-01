"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_1 = require("@/controllers/checkout");
const auth_1 = require("@/middlewares/auth");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/", auth_1.isAuth, checkout_1.checkout);
router.post("/instant", auth_1.isAuth, checkout_1.instantCheckout);
exports.default = router;
