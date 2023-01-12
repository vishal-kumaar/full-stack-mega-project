import Product from "../models/product.schema";
import formidable from "formidable";
import fs from "fs";
import {s3FileUpload, s3FileDelete} from "../services/imageUpload";
import Mongoose from "mongoose";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import config from "../config/index";

/********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:4000/api/product
 * @description Controller used for creating a new product.
 * @description Only admin can create the coupon
 * @description Uses AWS S3 Bucket for image upload
 * @return Product object
 *********************************************************/

export const addProduct = asyncHandler(async(req, res) => {
    const form = formidable({
        multiples: true,
        keepExtensions: true,
    });

    form.parse(req, async function(err, fields, files){
        try {
            if (err){
                throw new CustomError(err.message || "Something went wrong", 500);
            }

            const productId = new Mongoose.Types.ObjectId().toHexString();
            console.log(fields, files);

            // Check for fields
            if (!fields.name || !fields.price || !fields.decription || !fields.collectionId){
                throw new CustomError("Please fill all the details", 500);
            }

            // Handling images
            const imgArrayResp = Promise.all(
                Object.keys(files).map(async(fileKey, index) => {
                    const element = files[fileKey];
                    const data = fs.readFileSync(element.filepath);
                    const upload = await s3FileUpload({
                        bucketName: config.S3_BUCKET_NAME,
                        key: `products/${productId}/photos_${index+1}.png`,
                        body: data,
                        contentType: element.mimetype,
                    });
                    return {
                        secure_url: upload.Location
                    }
                })
            );

            const imgArray = await imgArrayResp;

            const product = await Product.create({
                _id: productId,
                photos: imgArray,
                ...fields,
            });

            if (!product){
                throw new CustomError("Product was not created", 400);
                // remove the image
            }

            res.status(200).json({
                success: true,
                product
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Something went wrong"
            })
        }
    })
})