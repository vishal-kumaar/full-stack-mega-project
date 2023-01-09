import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            requried: [true, "Name is required"],
            maxLength: [50, "Name must be less than 50"],
        }
    }
)