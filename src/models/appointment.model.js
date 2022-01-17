const {Schema,model} = require('mongoose');
const toJSON = require('./toJSON.plugin');

const appointmentSchema= Schema({
    teacherID:{type: Schema.Types.ObjectId, ref: 'User'}, 
    meetID:{type: Schema.Types.ObjectId, ref: 'ZoomData'}, 
    studentID:[{type: Schema.Types.ObjectId, ref: 'User'}], 
    paymentID:[{type: Schema.Types.ObjectId, ref: 'Payment'}], 
    meetLimit:{type:Number,default:8},
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