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

    if (!existingCoupon){
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
    })
});


/********************************************************
 * @DEACTIVATE_COUPON
 * @route https://localhost:4000/api/coupon/deactive/:couponId
 * @description Controller used for deactivating the coupon
 * @description Only admin and moderator can update the coupon 
 * @return Coupon Object with success message "Coupon Deactivated Successfully" 
 *********************************************************/

/********************************************************
 * @DELETE_COUPON
 * @route https://localhost:4000/api/coupon/:couponId
 * @description Controller used for deleting the coupon
 * @description Only admin and moderator can delete the coupon 
 * @return Coupon Object with success message "Coupon Deleted Successfully" 
 *********************************************************/

/********************************************************
 * @GET_ALL_COUPONS
 * @route https://localhost:4000/api/coupon/
 * @description Controller used for getting all coupons details
 * @description Only admin and moderator can delete the coupon 
 * @return All Coupons Object
 *********************************************************/