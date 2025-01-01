"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUrl = exports.generateS3ClientPublicUrl = exports.formatFileSize = exports.formatBook = exports.formatUserProfile = exports.sendErrorResponse = void 0;
const sendErrorResponse = ({ res, message, status, }) => {
    res.status(status).json({ message });
};
exports.sendErrorResponse = sendErrorResponse;
const formatUserProfile = (user) => {
    var _a, _b;
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: (_a = user.avatar) === null || _a === void 0 ? void 0 : _a.url,
        signedUp: user.signedUp,
        authorId: (_b = user.authorId) === null || _b === void 0 ? void 0 : _b.toString(),
        books: user.books.map((b) => b.toString()),
    };
};
exports.formatUserProfile = formatUserProfile;
const formatBook = (book) => {
    const { _id, title, slug, genre, price, cover, averageRating } = book;
    return {
        id: (_id === null || _id === void 0 ? void 0 : _id.toString()) || "",
        title: title,
        slug: slug,
        genre: genre,
        price: {
            mrp: (price.mrp / 100).toFixed(2),
            sale: (price.sale / 100).toFixed(2),
        },
        cover: cover === null || cover === void 0 ? void 0 : cover.url,
        rating: averageRating === null || averageRating === void 0 ? void 0 : averageRating.toFixed(1),
    };
};
exports.formatBook = formatBook;
function formatFileSize(bytes) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
exports.formatFileSize = formatFileSize;
const generateS3ClientPublicUrl = (bucketName, uniqueKey) => {
    return `https://${bucketName}.s3.amazonaws.com/${uniqueKey}`;
};
exports.generateS3ClientPublicUrl = generateS3ClientPublicUrl;
const sanitizeUrl = (url) => {
    return url.replace(/ /g, "%20");
};
exports.sanitizeUrl = sanitizeUrl;
