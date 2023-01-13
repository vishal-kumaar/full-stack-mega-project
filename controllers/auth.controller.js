import User from "../models/user.schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import cookieOptions from "../utils/cookieOptions";
import mailHelper from "../utils/mailHelper";
import crypto from "crypto";

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
});

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
});

/********************************************************
 * @FORGOT_PASSWORD
 * @route https://localhost:4000/api/auth/password/forgot
 * @description User will submit email and we will generate a token to forgot password
 * @parameters email
 * @return Success message - email send
*********************************************************/

export const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;

    // Email validation
    if (!email){
        throw new CustomError("Email is required", 401);
    }

    const user = await User.findOne({email});

    // user validation
    if (!user){
        throw new CustomError("User not found", 404);
    }

    const resetToken = user.generateForgotPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`;

    const text = `Your password reset url is \n\n ${resetUrl} \n\n`;

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email for website",
            text: text,
        });

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`,
        })
    } catch (error) {
        // roll back - clear fields and save
        user.generateForgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save({validateBeforeSave: true});

        throw new CustomError(error.message || 'Failed  send email', 500);
    }
});

/********************************************************
 * @RESET_PASSWORD
 * @route https://localhost:4000/api/auth/password/reset/:resetToken
 * @description User will submit email and we will generate a token
 * @parameters token from url, password and confirmpass token
 * @return User object
*********************************************************/

export const resetPassword = asyncHandler(async (req, res) => {
    const{token: resetToken} = req.params;
    const {password, confirmPassword} = req.body;

    const resetPasswordToken = crypto
    .createHash('sha5256')
    .update(resetToken)
    .digest("hex");
   
    const user = await User.findOne({
        forgotPasswordToken: resetPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    });

    if (!user){
        throw new CustomError("Password token is invalid or expired", 400);
    }
    
    if (password !== confirmPassword){
        throw new CustomError("Password doesn't match", 400);
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    
    await user.save({validateBeforeSave: true});

    // Create a token and send to the user
    const token = user.getJwtToken();
    res.cookies("token", token, cookieOptions);

    res.status(200).json({
        success: true,
        user
    })
});

/********************************************************
 * @CHANGE_PASSWORD
 * @route https://localhost:4000/api/auth/password/changePassword/:id
 * @description User will able to change the previous password
 * @parameters Old password and New password
 * @return User object
*********************************************************/

export const changePassword = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {oldPassword, newPassword} = req.body;

    if (!id){
        throw new CustomError("Id is required", 400);
    }

    if (!oldPassword || !newPassword){
        throw new CustomError("Old password and new password are required", 400);
    }

    const user = await User.findOne({id});

    if (!user){
        throw new CustomError("User not found", 400);
    }

    if (!user.comparePassword(oldPassword)){
        throw new CustomError("Entered old password is wrong", 400);
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: true});
    
    res.status(200).json({
        success: true,
        user
    })
});

/********************************************************
 * @GET_PROFILE
 * @REQUEST_TYPE GET
 * @route https://localhost:4000/api/auth/profile
 * @description Check for token and populate req.user
 * @parameters 
 * @return User object
*********************************************************/

export const getProfile = asyncHandler(async(req, res) => {
    const {user} = req;

    if (!user){
        throw new CustomError("User not found", 404);
    }
    res.status(200).json({
        success: true,
        user
    })
})