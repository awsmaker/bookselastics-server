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
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailtrap_1 = require("mailtrap");
const TOKEN = process.env.MAILTRAP_TOKEN;
const client = new mailtrap_1.MailtrapClient({ token: TOKEN });
const transport = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_TEST_USER,
        pass: process.env.MAILTRAP_TEST_PASS,
    },
});
const sendVerificationMailProd = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = {
        email: "no-reply@fsniraj.dev",
        name: "User Sign In",
    };
    const recipients = [
        {
            email: options.to,
        },
    ];
    yield client.send({
        from: sender,
        to: recipients,
        template_uuid: "e1e23630-8364-4fdb-814f-32eea50e192f",
        template_variables: {
            user_name: options.name,
            sign_in_link: options.link,
        },
    });
});
const sendVerificationTestMail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    yield transport.sendMail({
        to: options.to,
        from: process.env.VERIFICATION_MAIL,
        subject: "Auth Verification",
        html: `
            <div>
              <p>Please click on <a href="${options.link}">this link</a> to verify you account.</p>
            </div> 
          `,
    });
});
const mail = {
    sendVerificationMail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV === "development")
                yield sendVerificationTestMail(options);
            else
                yield sendVerificationMailProd(options);
        });
    },
};
exports.default = mail;
