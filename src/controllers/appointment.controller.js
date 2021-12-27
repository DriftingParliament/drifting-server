const { appointmentService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError');
const { Appointment } = require("../models");
const stripe = require('stripe')('sk_test_51K4FivSGS4s5bT6h0cn5wrprQkBq50hiZ43bMBZ78lzitXt5BBUPPQDv3pbJbVB40pSw38gmiZlh5omFJDrPtgyA00MLAiK6MK');


const createAppointment = catchAsync(async(req,res,next) =>{
    try {
    
        const { signedCookies = {} } = req
        let zoomToken= req.zoomToken ? req.zoomToken :signedCookies.zoomToken
        const paymentData = await appointmentService.createPayment(req.body.paymentIntent)
        const zoomData =await appointmentService.createMeet(zoomToken,req.body.appointmentData)
        const appointmentData =await appointmentService.createAppointment(req.body.appointmentData,req.user,zoomData._id,paymentData._id)
        return res.status(httpStatus.OK).send({success:true,appointmentData,zoomData})

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
const deleteAppointment = catchAsync(async(req,res,next) =>{
    try {
        const appointmentID =req.params.id
        const { signedCookies = {} } = req
        let zoomToken= req.zoomToken ? req.zoomToken :signedCookies.zoomToken
        const appointmentData=await Appointment.findById(appointmentID).populate('meetID','id').populate('paymentID','id')
        console.log('appointmentData',appointmentData)
        const response =await appointmentService.deleteAppointment(appointmentData.meetID.id,zoomToken,appointmentData.paymentID.id,stripe)
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const patchAppointment = catchAsync(async(req,res,next) =>{
    try {
    
        const appointmentID =req.params.id
        const updateData = req.body
        const response =await appointmentService.patchAppointment(appointmentID,updateData)
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

const checkout = catchAsync(async(req,res,next)=>{
     const { receipt_email="bhavindhodia13@gmail.com"} = req.body;
    try {
         const paymentIntent = await stripe.paymentIntents.create({
            amount:process.env.PAYMENT_AMOUNT,
            currency: "usd",
          
            automatic_payment_methods: {
            enabled: true,
            },
         
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '510 Townsend St',
      postal_code: '98140',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
    },
  },
            description:"For Appointment",
            receipt_email
        });
        res.status(httpStatus.OK).send({success:true,clientSecret: paymentIntent.client_secret,metadata:paymentIntent.metadata})
       
    } catch (error) {
        console.log('err',error)
         return next(new ApiError(error.statusCode, error.message));
    }
})

module.exports = {createAppointment,getAppointment,checkout,getTeacherList,patchAppointment,deleteAppointment}