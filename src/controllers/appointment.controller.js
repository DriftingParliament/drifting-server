const { appointmentService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError')
const crypto = require('crypto')
const stripe = require('stripe')('sk_test_51K4FivSGS4s5bT6h0cn5wrprQkBq50hiZ43bMBZ78lzitXt5BBUPPQDv3pbJbVB40pSw38gmiZlh5omFJDrPtgyA00MLAiK6MK');


const createAppointment = catchAsync(async(req,res,next) =>{
    try {
    
        const response =await appointmentService.createAppointment(req.body,req.user)
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const getAppointment = catchAsync(async(req,res,next) =>{
    try {
    
        const response =await appointmentService.getAppointment()
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const getTeacherList = catchAsync(async(req,res,next) =>{
    try {
    
        const response =await appointmentService.getTeacherList()
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})

const signature = catchAsync(async(req,res,next)=>{
    const timestamp = new Date().getTime() - 30000
    const msg = Buffer.from(process.env.ZOOM_JWT_API_KEY + req.body.meetingNumber + timestamp + req.body.role).toString('base64')
    const hash = crypto.createHmac('sha256', process.env.ZOOM_JWT_API_SECRET).update(msg).digest('base64')
    const signature = Buffer.from(`${process.env.ZOOM_JWT_API_KEY}.${req.body.meetingNumber}.${timestamp}.${req.body.role}.${hash}`).toString('base64')

  res.json({
      success:true,
    signature: signature
  })
})
const YOUR_DOMAIN = 'http://localhost:3000/studentDashboard';

const checkout= catchAsync(async(req,res,next) =>{
try {
    const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: "price_1K4HegSGS4s5bT6hpQASYrGM",
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  return res.status(httpStatus.OK).send({success:true,session})
  //res.redirect(303, session.url);
} catch (error) {
    return next(new ApiError(error.statusCode, error.message));
}
})


module.exports = {createAppointment,getAppointment,signature,checkout,getTeacherList}