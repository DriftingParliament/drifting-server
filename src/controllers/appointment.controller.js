const { appointmentService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError');
const { Appointment } = require("../models");
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51K4FivSGS4s5bT6h0cn5wrprQkBq50hiZ43bMBZ78lzitXt5BBUPPQDv3pbJbVB40pSw38gmiZlh5omFJDrPtgyA00MLAiK6MK');

const createAppointment = catchAsync(async(req,res,next) =>{
    try {
        console.log("appointmentData",req.body.appointmentData)
        const {appointmentData} = req.body
        const duplicate = await Appointment.find({
            startDate:appointmentData.startDate,
            endDate:appointmentData.endDate,
            teacherID:appointmentData.teacherID
        }).exec()
        console.log("duplicate",duplicate);
        if(duplicate.length>0){
            return next(new ApiError(httpStatus.CONFLICT , 'Appointment at that time with teacher already booked'));
        }
        const { signedCookies = {} } = req
        let zoomToken= req.zoomToken ? req.zoomToken :signedCookies.zoomToken
       // const paymentData = await appointmentService.createPayment(req.body.paymentIntent)
        const zoomData =await appointmentService.createMeet(zoomToken,req.body.appointmentData)
        const newAppointment =await appointmentService.createAppointment(req.body.appointmentData,req.user,zoomData._id)
        return res.status(httpStatus.OK).send({success:true,newAppointment,zoomData})

    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const studentUpdate = catchAsync(async(req,res,next) =>{
    try {
        const {appointmentData,paymentIntent,studentID}=req.body
        if(studentID===undefined|| studentID===null){
            return next(new ApiError(httpStatus.REQUEST_TIMEOUT, "Time expired. Please retry"));
        }
            console.log("appointmentData",appointmentData)
            console.log("paymentIntent",paymentIntent)
            console.log("studentID",studentID)
            const paymentData = await appointmentService.createPayment(paymentIntent,appointmentData._id,studentID)
            const appointment = await Appointment.findOneAndUpdate({_id:appointmentData._id},{$push:{studentID:studentID,paymentID:paymentData._id}})
            //const appointment = await Appointment.findOne({_id:appointmentData._id})
            //console.log("paymentData",paymentData)
            console.log("appointment",appointment)
            return res.status(httpStatus.OK).send({success:true})

        

    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})

const getAppointment = catchAsync(async(req,res,next) =>{
    try {
    const {viewName,currentDate}=req.query
    /* console.log("req.user",req.user) */
 /*    console.log("viewName,currentDate",req.query) */

    const response =await appointmentService.getAppointment(viewName,currentDate,req.user._id,req.user.role)
    console.log("Getting Appointments count =>",response.appointmentData.length)
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
        const appointmentData=await Appointment.findById(appointmentID).populate('meetID','id').populate('paymentID','id').populate('studentID','name')
        //console.log('appointmentData',appointmentData)
        const response =await appointmentService.deleteAppointment(appointmentData,zoomToken,stripe)
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const patchAppointment = catchAsync(async(req,res,next) =>{
    try {
    
        const appointmentID =req.params.id
        const {appointmentData} = req.body
        console.log("appointmentData", appointmentData);
      console.log("appointmentID", appointmentID);
        const response =await appointmentService.patchAppointment(appointmentID,appointmentData)
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const getUserByRole = catchAsync(async(req,res,next) =>{
    try {
        const {role}=req.params
       
        const response =await appointmentService.getListByRole(role.toUpperCase())
        
        return res.status(httpStatus.OK).send(response)
    } catch (error) {
        console.log("error",error)
        return next(new ApiError(error.statusCode, error.message));
    }
})


const meetings=catchAsync(async(req,res,next)=>{
    try{
        const response=await  Appointment.find({studentID:req.user._id,startDate:{$gte:Date()}}).populate('teacherID','name').populate('meetID','join_url');
      
        return res.status(httpStatus.OK).send(response)
    }
    catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const paymentStatus=catchAsync(async(req,res,next)=>{
    try{
        const response=await  stripe.paymentIntents.retrieve(req.params.paymentIntent);
        console.log("response",response.charges.data[0].status)
        return res.status(httpStatus.OK).send(response)
    }
    catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})

const checkout = catchAsync(async(req,res,next)=>{

     const { email="bhavindhodia13@gmail.com",name} = req.body.userData;
     const { title} = req.body.appointmentData;
    console.log(req.body);
    try {
         const paymentIntent = await stripe.paymentIntents.create({
            amount:process.env.PAYMENT_AMOUNT,
            currency: "cad",
           payment_method_types: ['card'],
            /* automatic_payment_methods: {
            enabled: true,
            }, */
         
  shipping: {
    name,
    address: {
      line1: '510 Townsend St',
      postal_code: '98140',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
    },
  },
            description:`Payment by ${name} for ${title}`,
            receipt_email:email,
            metadata:{"by":"Bhavin Dhodia"}
        });
        res.status(httpStatus.OK).send({success:true,clientSecret: paymentIntent.client_secret,metadata:paymentIntent.metadata})
       
    } catch (error) {
        console.log('err',error)
         return next(new ApiError(error.statusCode, error.message));
    }
})

module.exports = {createAppointment,meetings,paymentStatus,getAppointment,checkout,getUserByRole,patchAppointment,deleteAppointment,studentUpdate}