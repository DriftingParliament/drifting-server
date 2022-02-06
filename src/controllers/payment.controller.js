const catchAsync = require("../utils/catchAsync");
require("dotenv").config();
const Stripe = require("stripe");

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Payment, Appointment } = require("../models");

// Loading Stripe API Key
const stripe = Stripe(process.env.STRIPE_API_KEY);

//Get all payments made by student for that teacher appointment
// [ ] - Get payment for that specfic teacher only
const getAll = catchAsync(async (req, res, next) => {
  try {
   // console.log("req.user",req.user)
    const {user} = req
    let roleID = user.role.toString().toLowerCase().concat("ID") ;
     paymentIntents = await Payment.find({ [roleID]: user._id });
    
    return res.status(httpStatus.OK).send({ success: true, paymentIntents });
  
  } catch (error) {
    return next(new ApiError(error.statusCode, error.message));
  }
});

// Create payment intent to initialize the payment
const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { email, name } = req.body.userData;
  const {
    _id,
    title,
    notes,
    readOnly,
    allDay,
    createdAt,
    updatedAt,
    startDate,
    endDate,
    meetLimit,
    meetID,
    teacherID
  } = req.body.appointmentData;
  // console.log(req.body);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: process.env.PAYMENT_AMOUNT,
      currency: "cad",
      payment_method_types: ["card"],
      /* automatic_payment_methods: {
            enabled: true,
            }, */

      /* shipping: {
        name,
        address: {
          line1: process.env.SHIPING_LINE_1,
          postal_code: process.env.POSTAL,
          city: process.env.CITY,
          state: process.env.STATE,
          country: process.env.COUNTRY,
        },
      }, */
      description: `Payment by ${name} for ${title}`,
      receipt_email: email,
      metadata: {
        _id,
        title,
        notes,
        readOnly,
        allDay,
        createdAt,
        updatedAt,
        startDate,
        endDate,
        meetLimit,
        teacherID: teacherID._id,
        meetID: meetID._id,
      },
    });
    console.log("Created payment Intent")
    res
      .status(httpStatus.OK)
      .send({
        success: true,
        paymentIntent
       // clientSecret: paymentIntent.client_secret,
        //metadata: paymentIntent.metadata,
      });
  } catch (error) {
    console.log("err", error);
    return next(new ApiError(httpStatus.BAD_GATEWAY, error.raw.message));
  }
});

// Create refund of single student for appointment
const refund = catchAsync(async (req, res, next) => {
  const paymentIntentId = req.params.paymentIntentId;
  const paymentId = req.body.paymentId;
  //console.log("paymentIntentId", paymentIntentId);
  //console.log("paymentId", paymentId);
  try {
    const refundStatus = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: process.env.PAYMENT_AMOUNT,
    });
    //console.log("refundStatus", refundStatus);
    if (refundStatus.status === "succeeded") {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      const updatedPayment= await Payment.findByIdAndUpdate(
        paymentId,
        { refunded: true, ...paymentIntent },
        { new: true }
      );
      //console.log("updatePaymentIntent", updatedAppointment);

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        updatedPayment.appointmentID,
        {
          $pull: {
            studentID: updatedPayment.studentID,
            paymentID: updatedPayment._id,
          },
        }
      );
      //console.log("appresp", updatePaymentIntent);
      return res.status(httpStatus.OK).send({
        success: true,
        refundStatus,
        updatedPayment,
        updatedAppointment,
      });
    }
    return res.status(httpStatus.OK).send({ success: false, refundStatus });
  } catch (error) {
    return res
      .status(httpStatus.OK)
      .send({ success: false, errorMessage: error.message });
  }
});


// After payment get the status
const paymentStatus = catchAsync(async (req, res, next) => {
  try {
    const response = await stripe.paymentIntents.retrieve(
      req.params.paymentIntent
    );
    //console.log("response", response.charges.data[0].status);
    return res.status(httpStatus.OK).send(response);
  } catch (error) {
    return next(new ApiError(error.statusCode, error.message));
  }
});

const publishableKey = catchAsync(async (req, res, next) => {
  try {
    return res
      .status(httpStatus.OK)
      .send({ success: true, pKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (error) {
    return next(new ApiError(error.statusCode, error.message));
  }
});
module.exports = {
  getAll,
  createPaymentIntent,
  paymentStatus,
  refund,
  publishableKey,
};
