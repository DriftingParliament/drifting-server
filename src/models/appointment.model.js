const {Schema,model} = require('mongoose');
const toJSON = require('./toJSON.plugin');
const axios = require('axios');
const ZoomData= require('./zoomData.model');

const appointmentSchema= Schema({
    studentID:{type: Schema.Types.ObjectId, ref: 'User'},
    teacherID:{type: Schema.Types.ObjectId, ref: 'User'}, 
    meetID:{type: Schema.Types.ObjectId, ref: 'ZoomData'}, 
    paymentID:{type: Schema.Types.ObjectId, ref: 'Payment'}, 
  
    title:String,
    notes:String,
    startDate:Date,
    allDay:Boolean,
    location:String,
    endDate:Date
},{
    timestamps:true
})
appointmentSchema.plugin(toJSON);

const Appointment = model("Appointment",appointmentSchema)

module.exports = Appointment