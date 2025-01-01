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
exports.handlePayment = void 0;
const cart_1 = __importDefault(require("@/models/cart"));
const order_1 = __importDefault(require("@/models/order"));
const user_1 = __importDefault(require("@/models/user"));
const stripe_local_1 = __importDefault(require("@/stripe-local"));
const helper_1 = require("@/utils/helper");
const handlePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const event = stripe_local_1.default.webhooks.constructEvent(req.body, sig, endpointSecret);
        const succeed = event.type === "payment_intent.succeeded";
        const failed = event.type === "payment_intent.payment_failed";
        if (succeed || failed) {
            const stripeSession = event.data.object;
            const customerId = stripeSession.customer;
            const customer = (yield stripe_local_1.default.customers.retrieve(customerId));
            const { orderId, type, userId } = customer.metadata;
            const order = yield order_1.default.findByIdAndUpdate(orderId, {
                stripeCustomerId: customerId,
                paymentId: stripeSession.id,
                totalAmount: stripeSession.amount_received,
                paymentStatus: stripeSession.status,
                paymentErrorMessage: (_a = stripeSession.last_payment_error) === null || _a === void 0 ? void 0 : _a.message,
            });
            const bookIds = (order === null || order === void 0 ? void 0 : order.orderItems.map((item) => {
                return item.id.toString();
            })) || [];
            if (succeed && order) {
                yield user_1.default.findByIdAndUpdate(userId, {
                    $push: { books: { $each: bookIds }, orders: { $each: [order._id] } },
                });
                if (type === "checkout")
                    yield cart_1.default.findOneAndUpdate({ userId }, { items: [] });
            }
        }
    }
    catch (error) {
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Could not complete payment!",
            status: 400,
        });
    }
    res.send();
});
exports.handlePayment = handlePayment;
