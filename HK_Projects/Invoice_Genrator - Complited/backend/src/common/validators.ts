import joi from "joi";
import mongoose from "mongoose";

export const commonIdSchema = joi.object({
    id: joi.string().hex().length(24).required(),
});

export const objectId = () =>
    joi.string().custom((value, helpers) => {
        if (!mongoose?.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "ObjectId Validation").allow("", null);