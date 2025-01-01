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
exports.generateFileUploadUrl = exports.uploadBookToAws = exports.uploadBookToLocalDir = exports.uploadCoverToCloudinary = exports.updateAvatarToAws = exports.updateAvatarToCloudinary = void 0;
const aws_1 = __importDefault(require("@/cloud/aws"));
const cludinary_1 = __importDefault(require("@/cloud/cludinary"));
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("./helper");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const updateAvatarToCloudinary = (file, avatarId) => __awaiter(void 0, void 0, void 0, function* () {
    if (avatarId) {
        yield cludinary_1.default.uploader.destroy(avatarId);
    }
    const { public_id, secure_url } = yield cludinary_1.default.uploader.upload(file.filepath, {
        width: 300,
        height: 300,
        gravity: "face",
        crop: "fill",
    });
    return { id: public_id, url: secure_url };
});
exports.updateAvatarToCloudinary = updateAvatarToCloudinary;
const updateAvatarToAws = (file, uniqueFileName, avatarId) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.AWS_PUBLIC_BUCKET;
    if (avatarId) {
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: avatarId,
        });
        yield aws_1.default.send(deleteCommand);
    }
    const putCommand = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fs_1.default.readFileSync(file.filepath),
    });
    yield aws_1.default.send(putCommand);
    return {
        id: uniqueFileName,
        url: (0, helper_1.generateS3ClientPublicUrl)(process.env.AWS_PUBLIC_BUCKET, uniqueFileName),
    };
});
exports.updateAvatarToAws = updateAvatarToAws;
const uploadCoverToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const { secure_url, public_id } = yield cludinary_1.default.uploader.upload(file.filepath);
    return { id: public_id, url: secure_url };
});
exports.uploadCoverToCloudinary = uploadCoverToCloudinary;
const uploadBookToLocalDir = (file, uniqueFileName) => {
    const bookStoragePath = path_1.default.join(__dirname, "../books");
    if (!fs_1.default.existsSync(bookStoragePath)) {
        fs_1.default.mkdirSync(bookStoragePath);
    }
    const filePath = path_1.default.join(bookStoragePath, uniqueFileName);
    fs_1.default.writeFileSync(filePath, fs_1.default.readFileSync(file.filepath));
};
exports.uploadBookToLocalDir = uploadBookToLocalDir;
const uploadBookToAws = (filepath, uniqueFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const putCommand = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_PUBLIC_BUCKET,
        Key: uniqueFileName,
        Body: fs_1.default.readFileSync(filepath),
    });
    yield aws_1.default.send(putCommand);
    return {
        id: uniqueFileName,
        url: (0, helper_1.generateS3ClientPublicUrl)(process.env.AWS_PUBLIC_BUCKET, uniqueFileName),
    };
});
exports.uploadBookToAws = uploadBookToAws;
const generateFileUploadUrl = (client, fileInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const { bucket, uniqueKey, contentType } = fileInfo;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: uniqueKey,
        ContentType: contentType,
    });
    return yield (0, s3_request_presigner_1.getSignedUrl)(client, command);
});
exports.generateFileUploadUrl = generateFileUploadUrl;
