import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import cokkieOptions from "../utils/cookieOptions";

/********************************************************
 * @signup
 * @route https://localhost:4000/api/auth/signup
 * @description User signup controller for creating a new user
 * @parameters name, email, password
 * @return User Object
*********************************************************/

export const signUp = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;

    if (!name || !email || !password){
        throw new CustomError("Please fill all fields", 400);
    }
    
    // Check if user exists
    const existingUser = await User.findOne({email});
    
    if (existingUser){
        throw new CustomError("User already exists", 400);
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const token = user.getJwtTokken();
    user.password = undefined;

    res.cookie("token", token, cokkieOptions);
    res.status(200).json({
        success: true,
        token,
        user
    })
})