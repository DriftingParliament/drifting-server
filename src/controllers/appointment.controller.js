const { appointmentService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require('http-status');
const ApiError =require('../utils/ApiError');
const { Appointment } = require("../models");
require('dotenv').config()
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY);
const moment=require("moment") 

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
            console.log("paymentIntentID",paymentIntent.id)
            console.log("studentID",studentID)
               const newPaymentIntent = await stripe.paymentIntents.retrieve(
                 paymentIntent.id
               );
            const paymentData = await appointmentService.createPayment(
              newPaymentIntent,
              appointmentData,
              studentID
            );
            const appointment = await Appointment.findOneAndUpdate({_id:appointmentData._id},{$push:{studentID:studentID,paymentID:paymentData._id}})
            //const appointment = await Appointment.findOne({_id:appointmentData._id})
            //console.log("paymentData",paymentData)
            console.log("appointment",appointment)
            return res.status(httpStatus.OK).send({success:true})

        

    } catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const studentUpdateNoPayment = catchAsync(async(req,res,next) =>{
    try {
        const {appointmentData,studentID}=req.body
        if(studentID===undefined|| studentID===null){
            return next(new ApiError(httpStatus.REQUEST_TIMEOUT, "Time expired. Please retry"));
          }
          if(appointmentData.price >=1){
          return next(new ApiError(httpStatus.NOT_ACCEPTABLE, "Amount for the meet should be 0"));
          
        }
            console.log("appointmentData",appointmentData)
            console.log("studentID",studentID)
           
            const appointment = await Appointment.findOneAndUpdate({_id:appointmentData._id},{$push:{studentID:studentID}})
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
        const {user} =req
        const roleId = user.role.toString().toLowerCase().concat('ID')
        const response=await  Appointment.find({[roleId]:req.user._id,startDate:{$gte:Date()}}).populate('studentID','name').populate('teacherID','name').populate('meetID',['join_url','start_url']);
        return res.status(httpStatus.OK).send(response)
    }
    catch (error) {
        return next(new ApiError(error.statusCode, error.message));
    }
})
const appointmentStats = catchAsync(async (req, res, next) => {
  try {
    const {user }= req
    console.log("user",user._id)
    const cardStatsData = await Appointment.aggregate([
      {
        $match: {
          teacherID: user._id,
        },
      },
      {
        $facet: {
          upCommingMeet: [
            {
              $match: {
                startDate: {
                  $gte: moment()
                    .startOf("day")
                    .toDate(),
                },
              },
            },
            {
              $count: "upCommingMeet",
            },
          ],
          todaysMeet: [
            {
              $match: {
                startDate: {
                  $gte: moment()
                    .startOf("day")
                    .toDate(),
                  $lte: moment()
                    .endOf("day")
                    .toDate(),
                },
              },
            },
            {
              $count: "todaysMeet",
            },
          ],
          registeredStudent: [
            {
              $match: {
                startDate: {
                  $gte: moment()
                    .startOf("day")
                    .toDate(),
                },
              },
            },
            {
              $project: {
                _id: "000",
                singleAppointment: {
                  $cond: {
                    if: { $isArray: "$studentID" },
                    then: { $size: "$studentID" },
                    else: 0,
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                registeredStudent: { $sum: "$singleAppointment" },
              },
            },
          ],
        },
      },
      { $unwind: "$todaysMeet" },
      { $unwind: "$upCommingMeet" },
      { $unwind: "$registeredStudent" },
      {
        $project: {
          todaysMeet: "$todaysMeet.todaysMeet",
          upCommingMeet: "$upCommingMeet.upCommingMeet",
          registeredStudent: "$registeredStudent.registeredStudent",
        },
      },
    ]);

  
    const chartStatsData = await Appointment.aggregate([
      {
        $match: {
          teacherID: user._id,
        },
      },
      {
        $project: {
          name: "$title",
          startDate: "$startDate",
          studentRegistered: {
            $cond: {
              if: { $isArray: "$studentID" },
              then: { $size: "$studentID" },
              else: 0,
            },
          },
        },
      },
      { $sort: { startDate: -1 } },
      { $limit: 5 },
    ]);
    console.log("chartStatsData ", chartStatsData);
    return res
      .status(httpStatus.OK)
      .send({
        success: true,
        cardStatsData: cardStatsData[0],
        chartStatsData: chartStatsData,
      });
  } catch (error) {
    return next(new ApiError(error.statusCode, error.message));
  }
});


module.exports = {
  createAppointment,
  appointmentStats,
  meetings,
  getAppointment,
  getUserByRole,
  patchAppointment,
  deleteAppointment,
  studentUpdate,
  studentUpdateNoPayment,
};