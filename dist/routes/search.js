"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../controllers/search");
const express_1 = require("express");
const searchRouter = (0, express_1.Router)();
searchRouter.get("/books", search_1.searchBooks);
exports.default = searchRouter;
