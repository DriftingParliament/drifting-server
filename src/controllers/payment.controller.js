const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')('sk_test_51K4FivSGS4s5bT6h0cn5wrprQkBq50hiZ43bMBZ78lzitXt5BBUPPQDv3pbJbVB40pSw38gmiZlh5omFJDrPtgyA00MLAiK6MK');
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError');

const getAllPayments=catchAsync(async(req,res,next)=>{
try {
    const paymentIntents = await stripe.paymentIntents.list({
  limit: 3,
});
console.log("paymentIntents",paymentIntents)
return res.status(httpStatus.OK).send({success:true,paymentIntents})
} catch (error) {
    return next(new ApiError(error.statusCode, error.message));
}
})

module.exports = {getAllPayments}