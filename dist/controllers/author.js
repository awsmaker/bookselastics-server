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
exports.getBooks = exports.getAuthorDetails = exports.updateAuthor = exports.registerAuthor = void 0;
const author_1 = __importDefault(require("../models/author"));
const user_1 = __importDefault(require("../models/user"));
const helper_1 = require("../utils/helper");
const slugify_1 = __importDefault(require("slugify"));
const registerAuthor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, user } = req;
    if (!user.signedUp) {
        return (0, helper_1.sendErrorResponse)({
            message: "User must be signed up before registering as author!",
            status: 401,
            res,
        });
    }
    const newAuthor = new author_1.default({
        name: body.name,
        about: body.about,
        userId: user.id,
        socialLinks: body.socialLinks,
    });
    const uniqueSlug = (0, slugify_1.default)(`${newAuthor.name} ${newAuthor._id}`, {
        lower: true,
        replacement: "-",
    });
    newAuthor.slug = uniqueSlug;
    yield newAuthor.save();
    const updatedUser = yield user_1.default.findByIdAndUpdate(user.id, {
        role: "author",
        authorId: newAuthor._id,
    }, { new: true });
    let userResult;
    if (updatedUser) {
        userResult = (0, helper_1.formatUserProfile)(updatedUser);
    }
    res.json({
        message: "Thanks for registering as an author.",
        user: userResult,
    });
});
exports.registerAuthor = registerAuthor;
const updateAuthor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, user } = req;
    yield author_1.default.findByIdAndUpdate(user.authorId, {
        name: body.name,
        about: body.about,
        socialLinks: body.socialLinks,
    });
    res.json({ message: "Your details updated successfully." });
});
exports.updateAuthor = updateAuthor;
const getAuthorDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const author = yield author_1.default.findById(id).populate("books");
    if (!author)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Author not found!",
            status: 404,
        });
    res.json({
        id: author._id,
        name: author.name,
        about: author.about,
        socialLinks: author.socialLinks,
        books: (_a = author.books) === null || _a === void 0 ? void 0 : _a.map((book) => {
            var _a, _b, _c;
            return {
                id: (_a = book._id) === null || _a === void 0 ? void 0 : _a.toString(),
                title: book.title,
                slug: book.slug,
                genre: book.genre,
                price: {
                    mrp: (book.price.mrp / 100).toFixed(2),
                    sale: (book.price.sale / 100).toFixed(2),
                },
                cover: (_b = book.cover) === null || _b === void 0 ? void 0 : _b.url,
                rating: (_c = book.averageRating) === null || _c === void 0 ? void 0 : _c.toFixed(1),
            };
        }),
    });
});
exports.getAuthorDetails = getAuthorDetails;
const getBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorId } = req.params;
    const author = yield author_1.default.findById(authorId).populate("books");
    if (!author)
        return (0, helper_1.sendErrorResponse)({
            message: "Unauthorized request!",
            res,
            status: 403,
        });
    res.json({
        books: author.books.map((book) => {
            var _a;
            return ({
                id: (_a = book._id) === null || _a === void 0 ? void 0 : _a.toString(),
                title: book.title,
                slug: book.slug,
                status: book.status,
            });
        }),
    });
});
exports.getBooks = getBooks;
