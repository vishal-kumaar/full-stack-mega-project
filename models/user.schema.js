import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            requried: [true, "Name is required"],
            maxLength: [50, "Name must be less than 50 characters"],
        },
        email: {
            type: String,
            requried: [true, "Email is required"],
            unique: true,
            
        },
        password: {
            type: String,
            requried: [true, "Password is required"],
            minLength: [8, "Password must be atleast of 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles),
            default: AuthRoles.USER
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true
    }
)

export default mongoose.model("User", userSchema);