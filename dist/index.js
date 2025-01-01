"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connect_1 = require("./db/connect");
const middlewares_1 = require("./middlewares");
const webhook_1 = __importDefault(require("./routes/webhook"));
const app = (0, express_1.default)();
const publicPath = 'path_to_public_directory';
(0, connect_1.dbConnect)();
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [process.env.APP_URL, process.env.APP_URL_2],
    credentials: true,
}));
app.use("/webhook", webhook_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use("/books", middlewares_1.isAuth, middlewares_1.isValidReadingRequest, express_1.default.static(publicPath));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
