const {Schema,model} = require('mongoose');
const toJSON = require('./toJSON.plugin');

const appointmentSchema= Schema({
    studentID:{type: Schema.Types.ObjectId, ref: 'User'},
    teacherID:{type: Schema.Types.ObjectId, ref: 'User'},
    title:String,
    notes:String,
    startDate:Date,
    allDay:Boolean,
    endDate:Date
},{
    timestamps:true
})
appointmentSchema.plugin(toJSON);
const Appointment = model("Appointment",appointmentSchema)

module.exports = Appointment