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
exports.updateProfile = exports.logout = exports.sendProfileInfo = exports.verifyAuthToken = exports.generateAuthLink = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verificationToken_1 = __importDefault(require("../models/verificationToken"));
const user_1 = __importDefault(require("../models/user"));
const mail_1 = __importDefault(require("../utils/mail"));
const helper_1 = require("../utils/helper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fileUpload_1 = require("../utils/fileUpload");
const slugify_1 = __importDefault(require("slugify"));
const generateAuthLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    let user = yield user_1.default.findOne({ email });
    if (!user) {
        user = yield user_1.default.create({ email });
    }
    const userId = user._id.toString();
    yield verificationToken_1.default.findOneAndDelete({ userId });
    const randomToken = crypto_1.default.randomBytes(36).toString("hex");
    yield verificationToken_1.default.create({
        userId,
        token: randomToken,
    });
    const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;
    yield mail_1.default.sendVerificationMail({
        link,
        to: user.email,
        name: user.name || user.email,
    });
    res.json({ message: "Please check you email for link." });
});
exports.generateAuthLink = generateAuthLink;
const verifyAuthToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, userId } = req.query;
    if (typeof token !== "string" || typeof userId !== "string") {
        return (0, helper_1.sendErrorResponse)({
            status: 403,
            message: "Invalid request!",
            res,
        });
    }
    const verificationToken = yield verificationToken_1.default.findOne({ userId });
    if (!verificationToken || !verificationToken.compare(token)) {
        return (0, helper_1.sendErrorResponse)({
            status: 403,
            message: "Invalid request, token mismatch!",
            res,
        });
    }
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return (0, helper_1.sendErrorResponse)({
            status: 500,
            message: "Something went wrong, user not found!",
            res,
        });
    }
    yield verificationToken_1.default.findByIdAndDelete(verificationToken._id);
    const payload = { userId: user._id };
    const authToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    const isDevModeOn = process.env.NODE_ENV === "development";
    res.cookie("authToken", authToken, {
        httpOnly: true,
        secure: !isDevModeOn,
        sameSite: isDevModeOn ? "strict" : "none",
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });
    res.redirect(`${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify((0, helper_1.formatUserProfile)(user))}`);
});
exports.verifyAuthToken = verifyAuthToken;
const sendProfileInfo = (req, res) => {
    res.json({
        profile: req.user,
    });
};
exports.sendProfileInfo = sendProfileInfo;
const logout = (req, res) => {
    const isDevModeOn = process.env.NODE_ENV === "development";
    res
        .clearCookie("authToken", {
        httpOnly: true,
        secure: !isDevModeOn,
        sameSite: isDevModeOn ? "strict" : "none",
        path: "/",
    })
        .send();
};
exports.logout = logout;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_1.default.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        signedUp: true,
    }, {
        new: true,
    });
    if (!user)
        return (0, helper_1.sendErrorResponse)({
            res,
            message: "Something went wrong user not found!",
            status: 500,
        });
    const file = req.files.avatar;
    if (file && !Array.isArray(file)) {
        const uniqueFileName = `${user._id}-${(0, slugify_1.default)(req.body.name, {
            lower: true,
            replacement: "-",
        })}.png`;
        user.avatar = yield (0, fileUpload_1.updateAvatarToAws)(file, uniqueFileName, (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.id);
        yield user.save();
    }
    res.json({ profile: (0, helper_1.formatUserProfile)(user) });
});
exports.updateProfile = updateProfile;
