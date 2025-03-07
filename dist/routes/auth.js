"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const file_1 = require("../middlewares/file");
const validator_1 = require("../middlewares/validator");
const express_1 = require("express");
const authRouter = (0, express_1.Router)();
authRouter.post("/generate-link", (0, validator_1.validate)(validator_1.emailValidationSchema), auth_1.generateAuthLink);
authRouter.get("/verify", auth_1.verifyAuthToken);
authRouter.get("/profile", auth_2.isAuth, auth_1.sendProfileInfo);
authRouter.post("/logout", auth_2.isAuth, auth_1.logout);
authRouter.put("/profile", auth_2.isAuth, file_1.fileParser, (0, validator_1.validate)(validator_1.newUserSchema), auth_1.updateProfile);
exports.default = authRouter;
