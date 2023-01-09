import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrpyt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";

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

// Encrypt password
userSchema.pre("save", async function (next){
    if (this.modified("password")){
        this.password = await bcrpyt.hash(this.password, 10);
    }
    next();
})