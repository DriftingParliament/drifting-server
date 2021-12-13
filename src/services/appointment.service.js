const httpStatus = require('http-status')
const { Appointment } = require('../models')
const User = require('../models/user.model')

const createAppointment = async(body,user) =>{
    return new Promise(async(resolve,reject)=>{

        const saveData ={
            userID:user._id,
            ...body
        }
        try {
            const appointmentData = await Appointment.create(saveData)
            
             return resolve({success:true,appointmentData})
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
}
const getAppointment = async() =>{
    return new Promise(async(resolve,reject)=>{
        try {
            const appointmentData = await Appointment.find().populate("userID",'name')
             return resolve({success:true,appointmentData:appointmentData})
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
}
const getTeacherList = async() =>{
    return new Promise(async(resolve,reject)=>{
        try {
            const teachersList = await User.find({role:"TEACHER"}).select(['name','email','username'])
             return resolve({success:true,teachersList})
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
}

module.exports = {
    createAppointment,
    getAppointment,
    getTeacherList
};
