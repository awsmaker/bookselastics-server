"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const verificationTokenSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expires: {
        type: Date,
        default: Date.now(),
        expires: 60 * 60 * 24,
    },
});
verificationTokenSchema.pre("save", function (next) {
    if (this.isModified("token")) {
        const salt = (0, bcrypt_1.genSaltSync)(10);
        this.token = (0, bcrypt_1.hashSync)(this.token, salt);
    }
    next();
});
verificationTokenSchema.methods.compare = function (token) {
    return (0, bcrypt_1.compareSync)(token, this.token);
};
const VerificationTokenModel = (0, mongoose_1.model)("VerificationToken", verificationTokenSchema);
exports.default = VerificationTokenModel;
