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
exports.deleteBook = exports.getFeaturedBooks = exports.getRecommendedBooks = exports.generateBookAccessUrl = exports.getBookByGenre = exports.getBooksPublicDetails = exports.getAllPurchasedBooks = exports.updateBook = exports.createNewBook = void 0;
const book_1 = __importDefault(require("@/models/book"));
const helper_1 = require("@/utils/helper");
const client_s3_1 = require("@aws-sdk/client-s3");
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const fs_1 = __importDefault(require("fs"));
const aws_1 = __importDefault(require("@/cloud/aws"));
const fileUpload_1 = require("@/utils/fileUpload");
const author_1 = __importDefault(require("@/models/author"));
const path_1 = __importDefault(require("path"));
const cludinary_1 = __importDefault(require("@/cloud/cludinary"));
const user_1 = __importDefault(require("@/models/user"));
const history_1 = __importDefault(require("@/models/history"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const createNewBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { body, files, user } = req;
    const { title, description, genre, language, fileInfo, price, publicationName, publishedAt, uploadMethod, status, } = body;
    const { cover, book } = files;
    const newBook = new book_1.default({
        title,
        description,
        genre,
        language,
        fileInfo: { size: (0, helper_1.formatFileSize)(fileInfo.size), id: "" },
        price,
        publicationName,
        publishedAt,
        slug: "",
        author: new mongoose_1.Types.ObjectId(user.authorId),
        status,
        copySold: 0,
    });
    let fileUploadUrl = "";
    newBook.slug = (0, slugify_1.default)(`${newBook.title} ${newBook._id}`, {
        lower: true,
        replacement: "-",
    });
    const fileName = (0, slugify_1.default)(`${newBook._id} ${newBook.title}.epub`, {
        lower: true,
        replacement: "-",
    });
    if (uploadMethod === "local") {
        if (!book ||
            Array.isArray(book) ||
            book.mimetype !== "application/epub+zip") {
            return (0, helper_1.sendErrorResponse)({
                message: "Invalid book file!",
                status: 422,
                res,
            });
        }
        if (cover && !Array.isArray(cover) && ((_a = cover.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith("image"))) {
            newBook.cover = yield (0, fileUpload_1.uploadCoverToCloudinary)(cover);
        }
        (0, fileUpload_1.uploadBookToLocalDir)(book, fileName);
    }
    if (uploadMethod === "aws") {
        fileUploadUrl = yield (0, fileUpload_1.generateFileUploadUrl)(aws_1.default, {
            bucket: process.env.AWS_PRIVATE_BUCKET,
            contentType: fileInfo.type,
            uniqueKey: fileName,
        });
        if (cover && !Array.isArray(cover) && ((_b = cover.mimetype) === null || _b === void 0 ? void 0 : _b.startsWith("image"))) {
            const uniqueFileName = (0, slugify_1.default)(`${newBook._id} ${newBook.title}.png`, {
                lower: true,
                replacement: "-",
            });
            newBook.cover = yield (0, fileUpload_1.uploadBookToAws)(cover.filepath, uniqueFileName);
        }
    }
    newBook.fileInfo.id = fileName;
    yield author_1.default.findByIdAndUpdate(user.authorId, {
        $push: {
            books: newBook._id,
        },
    });
    yield newBook.save();
    yield user_1.default.findByIdAndUpdate(req.user.id, {
        $push: { books: newBook._id },
    });
    res.json({ fileUploadUrl, slug: newBook.slug });
});
exports.createNewBook = createNewBook;
const updateBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g;
    const { body, files, user } = req;
    const { title, description, genre, language, fileInfo, price, publicationName, publishedAt, uploadMethod, slug, status, } = body;
    const { cover, book: newBookFile } = files;
    const book = yield book_1.default.findOne({
        slug,
        author: user.authorId,
    });
    if (!book) {
        return (0, helper_1.sendErrorResponse)({
            message: "Book not found!",
            status: 404,
            res,
        });
    }
    book.title = title;
    book.description = description;
    book.language = language;
    book.publicationName = publicationName;
    book.genre = genre;
    book.publishedAt = publishedAt;
    book.price = price;
    book.status = status;
    if (uploadMethod === "local") {
        if (newBookFile &&
            !Array.isArray(newBookFile) &&
            newBookFile.mimetype === "application/epub+zip") {
            const uploadPath = path_1.default.join(__dirname, "../books");
            const oldFilePath = path_1.default.join(uploadPath, book.fileInfo.id);
            if (!fs_1.default.existsSync(oldFilePath))
                return (0, helper_1.sendErrorResponse)({
                    message: "Book file not found!",
                    status: 404,
                    res,
                });
            fs_1.default.unlinkSync(oldFilePath);
            const newFileName = (0, slugify_1.default)(`${book._id} ${book.title}`, {
                lower: true,
                replacement: "-",
            });
            const newFilePath = path_1.default.join(uploadPath, newFileName);
            const file = fs_1.default.readFileSync(newBookFile.filepath);
            fs_1.default.writeFileSync(newFilePath, file);
            book.fileInfo = {
                id: newFileName,
                size: (0, helper_1.formatFileSize)((fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.size) || newBookFile.size),
            };
        }
        if (cover && !Array.isArray(cover) && ((_c = cover.mimetype) === null || _c === void 0 ? void 0 : _c.startsWith("image"))) {
            if ((_d = book.cover) === null || _d === void 0 ? void 0 : _d.id) {
                yield cludinary_1.default.uploader.destroy(book.cover.id);
            }
            book.cover = yield (0, fileUpload_1.uploadCoverToCloudinary)(cover);
        }
    }
    let fileUploadUrl = "";
    if (uploadMethod === "aws") {
        if ((fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.type) === "application/epub+zip") {
            const deleteCommand = new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_PRIVATE_BUCKET,
                Key: book.fileInfo.id,
            });
            yield aws_1.default.send(deleteCommand);
            const fileName = (0, slugify_1.default)(`${book._id} ${book.title}.epub`, {
                lower: true,
                replacement: "-",
            });
            fileUploadUrl = yield (0, fileUpload_1.generateFileUploadUrl)(aws_1.default, {
                bucket: process.env.AWS_PRIVATE_BUCKET,
                contentType: fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.type,
                uniqueKey: fileName,
            });
            book.fileInfo = { id: fileName, size: (0, helper_1.formatFileSize)(fileInfo.size) };
        }
        if (cover && !Array.isArray(cover) && ((_e = cover.mimetype) === null || _e === void 0 ? void 0 : _e.startsWith("image"))) {
            if ((_f = book.cover) === null || _f === void 0 ? void 0 : _f.id) {
                const deleteCommand = new client_s3_1.DeleteObjectCommand({
                    Bucket: process.env.AWS_PUBLIC_BUCKET,
                    Key: book.cover.id,
                });
                yield aws_1.default.send(deleteCommand);
            }
            const uniqueFileName = (0, slugify_1.default)(`${book._id} ${book.title}.png`, {
                lower: true,
                replacement: "-",
            });
            book.cover = yield (0, fileUpload_1.uploadBookToAws)(cover.filepath, uniqueFileName);
        }
    }
    yield book.save();
    if (!((_g = user.books) === null || _g === void 0 ? void 0 : _g.includes(book._id.toString()))) {
        yield user_1.default.findByIdAndUpdate(user.id, {
            $push: { books: book._id },
        });
    }
    res.send(fileUploadUrl);
});
exports.updateBook = updateBook;
const getAllPurchasedBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.user.id).populate({
        path: "books",
        select: "author title cover slug",
        populate: { path: "author", select: "slug name" },
    });
    if (!user)
        return res.json({ books: [] });
    res.json({
        books: user.books.map((book) => {
            var _a;
            return ({
                id: book._id,
                title: book.title,
                cover: (_a = book.cover) === null || _a === void 0 ? void 0 : _a.url,
                slug: book.slug,
                author: {
                    name: book.author.name,
                    slug: book.author.slug,
                    id: book.author._id,
                },
            });
        }),
    });
});
exports.getAllPurchasedBooks = getAllPurchasedBooks;
const getBooksPublicDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield book_1.default.findOne({ slug: req.params.slug }).populate({
        path: "author",
        select: "name slug",
    });
    if (!book)
        return (0, helper_1.sendErrorResponse)({
            status: 404,
            message: "Book not found!",
            res,
        });
    const { _id, title, cover, author, slug, description, genre, language, publishedAt, publicationName, price: { mrp, sale }, fileInfo, averageRating, status, } = book;
    res.json({
        book: {
            id: _id,
            title,
            genre,
            status,
            language,
            slug,
            description,
            publicationName,
            fileInfo,
            publishedAt: publishedAt.toISOString().split("T")[0],
            cover: cover === null || cover === void 0 ? void 0 : cover.url,
            rating: averageRating === null || averageRating === void 0 ? void 0 : averageRating.toFixed(1),
            price: {
                mrp: (mrp / 100).toFixed(2),
                sale: (sale / 100).toFixed(2),
            },
            author: {
                id: author._id,
                name: author.name,
                slug: author.slug,
            },
        },
    });
});
exports.getBooksPublicDetails = getBooksPublicDetails;
const getBookByGenre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const books = yield book_1.default.find({
        genre: req.params.genre,
        status: { $ne: "unpublished" },
    }).limit(5);
    books.map(helper_1.formatBook);
    res.json({
        books: books.map(helper_1.formatBook),
    });
});
exports.getBookByGenre = getBookByGenre;
const generateBookAccessUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    const book = yield book_1.default.findOne({ slug });
    if (!book)
        return (0, helper_1.sendErrorResponse)({ res, message: "Book not found!", status: 404 });
    const user = yield user_1.default.findOne({ _id: req.user.id, books: book._id });
    if (!user)
        return (0, helper_1.sendErrorResponse)({ res, message: "User not found!", status: 404 });
    const history = yield history_1.default.findOne({
        reader: req.user.id,
        book: book._id,
    });
    const settings = {
        lastLocation: "",
        highlights: [],
    };
    if (history) {
        settings.highlights = history.highlights.map((h) => ({
            fill: h.fill,
            selection: h.selection,
        }));
        settings.lastLocation = history.lastLocation;
    }
    const bookGetCommand = new client_s3_1.GetObjectCommand({
        Bucket: process.env.AWS_PRIVATE_BUCKET,
        Key: book.fileInfo.id,
    });
    const accessUrl = yield (0, s3_request_presigner_1.getSignedUrl)(aws_1.default, bookGetCommand);
    res.json({ settings, url: accessUrl });
});
exports.generateBookAccessUrl = generateBookAccessUrl;
const getRecommendedBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(bookId)) {
        return (0, helper_1.sendErrorResponse)({ message: "Invalid book id!", res, status: 422 });
    }
    const book = yield book_1.default.findById(bookId);
    if (!book) {
        return (0, helper_1.sendErrorResponse)({ message: "Book not found!", res, status: 404 });
    }
    const recommendedBooks = yield book_1.default.aggregate([
        {
            $match: {
                genre: book.genre,
                _id: { $ne: book._id },
                status: { $ne: "unpublished" },
            },
        },
        {
            $lookup: {
                localField: "_id",
                from: "reviews",
                foreignField: "book",
                as: "reviews",
            },
        },
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" },
            },
        },
        {
            $sort: { averageRating: -1 },
        },
        {
            $limit: 5,
        },
        {
            $project: {
                _id: 1,
                title: 1,
                slug: 1,
                genre: 1,
                price: 1,
                cover: 1,
                averageRating: 1,
            },
        },
    ]);
    const result = recommendedBooks.map(helper_1.formatBook);
    res.json(result);
});
exports.getRecommendedBooks = getRecommendedBooks;
const getFeaturedBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const books = [
        {
            title: "Murder on the Orient Express",
            slogan: "Unravel the mystery, ride the Orient Express!",
            subtitle: "A thrilling journey through intrigue and deception.",
            cover: "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cac8-murder-on-the-orient-express.png",
            slug: "murder-on-the-orient-express-669e469bf094674648c4cac8",
        },
        {
            title: "To Kill a Mockingbird",
            slogan: "Discover courage in a small town.",
            subtitle: "A timeless tale of justice and compassion.",
            cover: "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cac9-to-kill-a-mockingbird.png",
            slug: "to-kill-a-mockingbird-669e469bf094674648c4cac9",
        },
        {
            title: "The Girl with the Dragon Tattoo",
            slogan: "Uncover secrets with the girl and her tattoo.",
            subtitle: "A gripping thriller of mystery and revenge.",
            cover: "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cad3-the-girl-with-the-dragon-tattoo.png",
            slug: "the-girl-with-the-dragon-tattoo-669e469bf094674648c4cad3",
        },
        {
            title: "The Hunger Games",
            slogan: "Survive the games, ignite the rebellion.",
            subtitle: "An epic adventure of survival and resilience.",
            cover: "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cad4-the-hunger-games.png",
            slug: "the-hunger-games-669e469bf094674648c4cad4",
        },
    ];
    res.json({ featuredBooks: books });
});
exports.getFeaturedBooks = getFeaturedBooks;
const deleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const { bookId } = req.params;
    const { user } = req;
    const deleteMethodAddedDate = 1722704247287;
    if (!(0, mongoose_1.isValidObjectId)(bookId)) {
        return (0, helper_1.sendErrorResponse)({ message: "Invalid book id!", res, status: 422 });
    }
    const book = yield book_1.default.findOne({ _id: bookId, author: user.authorId });
    if (!book) {
        return (0, helper_1.sendErrorResponse)({ message: "Book not found!", res, status: 404 });
    }
    const bookCreationTime = book._id.getTimestamp().getTime();
    if (deleteMethodAddedDate >= bookCreationTime) {
        return res.json({ success: false });
    }
    if (book.copySold >= 1) {
        return res.json({ success: false });
    }
    yield book_1.default.findByIdAndDelete(book._id);
    const author = yield author_1.default.findById(user.authorId);
    if (author) {
        author.books = author.books.filter((id) => id.toString() !== bookId);
        yield author.save();
    }
    const coverId = (_h = book.cover) === null || _h === void 0 ? void 0 : _h.id;
    const bookFileId = book.fileInfo.id;
    if (coverId) {
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_PUBLIC_BUCKET,
            Key: coverId,
        });
        yield aws_1.default.send(deleteCommand);
    }
    if (bookFileId) {
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_PRIVATE_BUCKET,
            Key: bookFileId,
        });
        yield aws_1.default.send(deleteCommand);
    }
    res.json({ success: true });
});
exports.deleteBook = deleteBook;
