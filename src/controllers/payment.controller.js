const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')('sk_test_51K4FivSGS4s5bT6h0cn5wrprQkBq50hiZ43bMBZ78lzitXt5BBUPPQDv3pbJbVB40pSw38gmiZlh5omFJDrPtgyA00MLAiK6MK');
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError');
const { Payment, Appointment } = require("../models");

const getAll=catchAsync(async(req,res,next)=>{
try {
const paymentIntents =await Payment.find().sort({_id:-1}).populate("studentID",'_id');

//console.log("paymentIntents",paymentIntents)
return res.status(httpStatus.OK).send({success:true,paymentIntents})
} catch (error) {
    return next(new ApiError(error.statusCode, error.message));
}
})
const refund=catchAsync(async(req,res,next)=>{
  const paymentIntentId=req.params.paymentIntentId
  const paymentId=req.body.paymentId
  console.log("paymentIntentId",paymentIntentId)
  console.log("paymentId",paymentId)
try {
   const refundStatus= await stripe.refunds.create({
                            payment_intent:paymentIntentId,
                            amount: process.env.PAYMENT_AMOUNT,
                    });
console.log("refundStatus",refundStatus)
if(refundStatus.status==="succeeded"){
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const updatePaymentIntent=await Payment.findByIdAndUpdate(paymentId,{refunded:true,...paymentIntent},{new:true})
  console.log("updatePaymentIntent",updatePaymentIntent)

  const appresp = await Appointment.findByIdAndUpdate(updatePaymentIntent.appointmentID,{$pull:{"studentID":updatePaymentIntent.studentID,"paymentID":updatePaymentIntent._id}})
  console.log("appresp",updatePaymentIntent)
  return res.status(httpStatus.OK).send({success:true,refundStatus,updatePaymentIntent})
}
return res.status(httpStatus.OK).send({success:false,refundStatus})

} catch (error) {
  res.status(httpStatus.OK).send({success:false,errorMessage:error.message})  
  //return next(new ApiError(error.statusCode, error.message));
}
})

module.exports = {getAll,refund}