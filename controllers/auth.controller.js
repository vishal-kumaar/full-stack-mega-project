import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import cookieOptions from "../utils/cookieOptions";

/********************************************************
 * @SIGNUP
 * @route https://localhost:4000/api/auth/signup
 * @description User signup controller for creating a new user
 * @parameters name, email, password
 * @return User Object
*********************************************************/

export const signup = asyncHandler(async (req, res) => {
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

    const token = user.getJwtToken();
    user.password = undefined;

    res.cookie("token", token, cokkieOptions);
    res.status(200).json({
        success: true,
        token,
        user
    })
})

/********************************************************
 * @LOGIN
 * @route https://localhost:4000/api/auth/login
 * @description User login controller for login a user
 * @parameters email, password
 * @return User Object
*********************************************************/

export const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password){
        throw new CustomError("Please fill all fields", 400);
    }

    const user = await User.findOne({email}).select("+password");
    
    if (!user) {
        throw new CustomError("Invalid credentials", 400);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched){
        throw new CustomError("Invalid credentials - pass", 400);
    }

    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        success: true,
        token,
        user
    });
})

/********************************************************
 * @LOGOUT
 * @route https://localhost:4000/api/auth/logout
 * @description User logout by clearing user cookies
 * @parameters none
 * @return Success message
*********************************************************/

export const logout = asyncHandler(async (_req, res) => {
    // res.clearCookies()
    res.cookies("token", null, {
        expires: new Date(Date.now()),
        httpsOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged out"
    });
})