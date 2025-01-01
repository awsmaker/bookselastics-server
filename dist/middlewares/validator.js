"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItemsSchema = exports.validate = exports.historyValidationSchema = exports.newReviewSchema = exports.updateBookSchema = exports.newBookSchema = exports.newAuthorSchema = exports.newUserSchema = exports.emailValidationSchema = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.emailValidationSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: "Email is missing!",
        invalid_type_error: "Invalid email type!",
    })
        .email("Invalid email!"),
});
exports.newUserSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Name is missing!",
        invalid_type_error: "Invalid name!",
    })
        .min(3, "Name must be 3 characters long!")
        .trim(),
});
exports.newAuthorSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Name is missing!",
        invalid_type_error: "Invalid name!",
    })
        .trim()
        .min(3, "Invalid name"),
    about: zod_1.z
        .string({
        required_error: "About is missing!",
        invalid_type_error: "Invalid about!",
    })
        .trim()
        .min(100, "Please write at least 100 characters about yourself!"),
    socialLinks: zod_1.z
        .array(zod_1.z.string().url("Social links can only be list of  valid URLs!"))
        .optional(),
});
const commonBookSchema = {
    uploadMethod: zod_1.z.enum(["aws", "local"], {
        required_error: "Please define a valid uploadMethod",
        message: "uploadMethod needs to be either aws or local",
    }),
    status: zod_1.z.enum(["published", "unpublished"], {
        required_error: "Please select at least one status.",
        message: "Please select at least one status.",
    }),
    title: zod_1.z
        .string({
        required_error: "Title is missing!",
        invalid_type_error: "Invalid title!",
    })
        .trim(),
    description: zod_1.z
        .string({
        required_error: "Description is missing!",
        invalid_type_error: "Invalid Description!",
    })
        .trim(),
    language: zod_1.z
        .string({
        required_error: "Language is missing!",
        invalid_type_error: "Invalid language!",
    })
        .trim(),
    publishedAt: zod_1.z.coerce.date({
        required_error: "Publish date is missing!",
        invalid_type_error: "Invalid publish date!",
    }),
    publicationName: zod_1.z
        .string({
        required_error: "Publication name is missing!",
        invalid_type_error: "Invalid publication name!",
    })
        .trim(),
    genre: zod_1.z
        .string({
        required_error: "Genre is missing!",
        invalid_type_error: "Invalid genre!",
    })
        .trim(),
    price: zod_1.z
        .string({
        required_error: "Price is missing!",
        invalid_type_error: "Invalid price!",
    })
        .transform((value, ctx) => {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            ctx.addIssue({ code: "custom", message: "Invalid Price Data!" });
            return zod_1.z.NEVER;
        }
    })
        .pipe(zod_1.z.object({
        mrp: zod_1.z
            .number({
            required_error: "MRP is missing!",
            invalid_type_error: "Invalid mrp price!",
        })
            .nonnegative("Invalid mrp!"),
        sale: zod_1.z
            .number({
            required_error: "Sale price is missing!",
            invalid_type_error: "Invalid sale price!",
        })
            .nonnegative("Invalid sale price!"),
    }))
        .refine((price) => price.sale <= price.mrp, "Sale price should be less then mrp!"),
};
const fileInfo = zod_1.z
    .string({
    required_error: "File info is missing!",
    invalid_type_error: "Invalid file info!",
})
    .transform((value, ctx) => {
    try {
        return JSON.parse(value);
    }
    catch (error) {
        ctx.addIssue({ code: "custom", message: "Invalid File Info!" });
        return zod_1.z.NEVER;
    }
})
    .pipe(zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "fileInfo.name is missing!",
        invalid_type_error: "Invalid fileInfo.name!",
    })
        .trim(),
    type: zod_1.z
        .string({
        required_error: "fileInfo.type is missing!",
        invalid_type_error: "Invalid fileInfo.type!",
    })
        .trim(),
    size: zod_1.z
        .number({
        required_error: "fileInfo.size is missing!",
        invalid_type_error: "Invalid fileInfo.size!",
    })
        .nonnegative("Invalid fileInfo.size!"),
}));
exports.newBookSchema = zod_1.z.object(Object.assign(Object.assign({}, commonBookSchema), { fileInfo }));
exports.updateBookSchema = zod_1.z.object(Object.assign(Object.assign({}, commonBookSchema), { slug: zod_1.z
        .string({
        message: "Invalid slug!",
    })
        .trim(), fileInfo: fileInfo.optional() }));
exports.newReviewSchema = zod_1.z.object({
    rating: zod_1.z
        .number({
        required_error: "Rating is missing!",
        invalid_type_error: "Invalid rating!",
    })
        .nonnegative("Rating must be within 1 to 5.")
        .min(1, "Minium rating should be 1")
        .max(5, "Maximum rating should be 5"),
    content: zod_1.z
        .string({
        invalid_type_error: "Invalid rating!",
    })
        .optional(),
    bookId: zod_1.z
        .string({
        required_error: "Book id is missing!",
        invalid_type_error: "Invalid book id!",
    })
        .transform((arg, ctx) => {
        if (!(0, mongoose_1.isValidObjectId)(arg)) {
            ctx.addIssue({ code: "custom", message: "Invalid book id!" });
            return zod_1.z.NEVER;
        }
        return arg;
    }),
});
exports.historyValidationSchema = zod_1.z.object({
    bookId: zod_1.z
        .string({
        required_error: "Book id is missing!",
        invalid_type_error: "Invalid book id!",
    })
        .transform((arg, ctx) => {
        if (!(0, mongoose_1.isValidObjectId)(arg)) {
            ctx.addIssue({ code: "custom", message: "Invalid book id!" });
            return zod_1.z.NEVER;
        }
        return arg;
    }),
    lastLocation: zod_1.z
        .string({
        invalid_type_error: "Invalid last location!",
    })
        .trim()
        .optional(),
    highlights: zod_1.z
        .array(zod_1.z.object({
        selection: zod_1.z
            .string({
            required_error: "Highlight selection is missing",
            invalid_type_error: "Invalid Highlight selection!",
        })
            .trim(),
        fill: zod_1.z
            .string({
            required_error: "Highlight fill is missing",
            invalid_type_error: "Invalid Highlight fill!",
        })
            .trim(),
    }))
        .optional(),
    remove: zod_1.z.boolean({
        required_error: "Remove is missing!",
        invalid_type_error: "remove must be a boolean value!",
    }),
});
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (result.success) {
            req.body = result.data;
            next();
        }
        else {
            const errors = result.error.flatten().fieldErrors;
            return res.status(422).json({ errors });
        }
    };
};
exports.validate = validate;
exports.cartItemsSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        product: zod_1.z
            .string({
            required_error: "Product id is missing!",
            invalid_type_error: "Invalid product id!",
        })
            .transform((arg, ctx) => {
            if (!(0, mongoose_1.isValidObjectId)(arg)) {
                ctx.addIssue({ code: "custom", message: "Invalid product id!" });
                return zod_1.z.NEVER;
            }
            return arg;
        }),
        quantity: zod_1.z.number({
            required_error: "Quantity is missing!",
            invalid_type_error: "Quantity must be number!",
        }),
    })),
});
