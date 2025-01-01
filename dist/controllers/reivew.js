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
exports.getPublicReviews = exports.getReview = exports.addReview = void 0;
const book_1 = __importDefault(require("@/models/book"));
const review_1 = __importDefault(require("@/models/review"));
const helper_1 = require("@/utils/helper");
const mongoose_1 = require("mongoose");
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId, rating, content } = req.body;
    yield review_1.default.findOneAndUpdate({ book: bookId, user: req.user.id }, { content, rating }, { upsert: true });
    const [result] = yield review_1.default.aggregate([
        {
            $match: {
                book: new mongoose_1.Types.ObjectId(bookId),
            },
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            },
        },
    ]);
    yield book_1.default.findByIdAndUpdate(bookId, {
        averageRating: result.averageRating,
    });
    res.json({
        message: "Review updated.",
    });
});
exports.addReview = addReview;
const getReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(bookId))
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Book id is not valid!",
            status: 422,
        });
    const review = yield review_1.default.findOne({ book: bookId, user: req.user.id });
    if (!review)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Review not found!",
            status: 404,
        });
    res.json({
        content: review.content,
        rating: review.rating,
    });
});
exports.getReview = getReview;
const getPublicReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_1.default.find({ book: req.params.bookId }).populate({ path: "user", select: "name avatar" });
    res.json({
        reviews: reviews.map((r) => {
            return {
                id: r._id,
                content: r.content,
                date: r.createdAt.toISOString().split("T")[0],
                rating: r.rating,
                user: {
                    id: r.user._id,
                    name: r.user.name,
                    avatar: r.user.avatar,
                },
            };
        }),
    });
});
exports.getPublicReviews = getPublicReviews;
