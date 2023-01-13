import Coupon from "../models/coupon.schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";


/********************************************************
 * @CREATE_COUPON
 * @route https://localhost:4000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and moderator can create the coupon 
 * @return Coupon Object with success message "Coupon Created Successfully" 
 *********************************************************/

export const createCoupon = asyncHandler(async(req, res) => {
    const {code, discount} = req.body;

    if (!code || !discount){
        throw new CustomError("Coupon code or discount are required", 400);
    }

    const existingCoupon = await Coupon.findOne({code});

    if (existingCoupon){
        throw new CustomError("Coupon code is already exist", 400);
    }

    const coupon = await Coupon.create({
        code,
        discount,
        active: true
    });

    res.status(200).json({
        success: true,
        coupon
    });
});


/********************************************************
 * @DEACTIVATE_COUPON
 * @route https://localhost:4000/api/coupon/deactive/:couponId
 * @description Controller used for deactivating the coupon
 * @description Only admin and moderator can update the coupon 
 * @return Coupon Object with success message "Coupon Deactivated Successfully" 
 *********************************************************/

export const deactiveCoupon = asyncHandler(async(req, res) => {
    const {couponId} = req.params;

    if (!couponId){
        throw new CustomError("Coupon Id is required", 400);
    }

    const coupon = await Coupon.findOne({couponId});

    if (!coupon){
        throw new CustomError("Coupon is not found", 400);
    }

    coupon.active = false;

    await coupon.save({validateBeforeSave: true});

    res.status(200).json({
        success: true,
        coupon
    });
});

/********************************************************
 * @DELETE_COUPON
 * @route https://localhost:4000/api/coupon/:couponId
 * @description Controller used for deleting the coupon
 * @description Only admin and moderator can delete the coupon 
 * @return Coupon Object with success message "Coupon Deleted Successfully" 
 *********************************************************/

export const deleteCoupon = asyncHandler(async(req, res) => {
    const {couponId} = req.params;
    
    if (!couponId){
        throw new CustomError("Coupon id is required", 400);
    }

    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon){
        throw new CustomError("Coupon id is invalid", 400);
    }

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});

/********************************************************
 * @GET_ALL_COUPONS
 * @route https://localhost:4000/api/coupon/
 * @description Controller used for getting all coupons details
 * @description Only admin and moderator can delete the coupon 
 * @return All Coupons Object
 *********************************************************/

export const getAllCoupons = asyncHandler(async(req, res) => {
    const coupons = await Coupon.find({});

    if (!coupons){
        throw new CustomError("No coupon found", 400);
    }

    res.status(200).json({
        success: true,
        coupons
    });
});