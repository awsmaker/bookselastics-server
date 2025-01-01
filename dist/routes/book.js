"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const book_1 = require("@/controllers/book");
const auth_1 = require("@/middlewares/auth");
const file_1 = require("@/middlewares/file");
const validator_1 = require("@/middlewares/validator");
const express_1 = require("express");
const bookRouter = (0, express_1.Router)();
bookRouter.post("/create", auth_1.isAuth, auth_1.isAuthor, file_1.fileParser, (0, validator_1.validate)(validator_1.newBookSchema), book_1.createNewBook);
bookRouter.patch("/", auth_1.isAuth, auth_1.isAuthor, file_1.fileParser, (0, validator_1.validate)(validator_1.updateBookSchema), book_1.updateBook);
bookRouter.get("/list", auth_1.isAuth, book_1.getAllPurchasedBooks);
bookRouter.get("/details/:slug", book_1.getBooksPublicDetails);
bookRouter.get("/by-genre/:genre", book_1.getBookByGenre);
bookRouter.get("/read/:slug", auth_1.isAuth, book_1.generateBookAccessUrl);
bookRouter.get("/recommended/:bookId", book_1.getRecommendedBooks);
bookRouter.get("/featured", book_1.getFeaturedBooks);
bookRouter.delete("/:bookId", auth_1.isAuth, auth_1.isAuthor, book_1.deleteBook);
exports.default = bookRouter;