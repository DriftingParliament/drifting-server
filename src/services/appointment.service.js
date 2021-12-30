const httpStatus = require('http-status')
const { Appointment, Payment,ZoomData } = require('../models')
const User = require('../models/user.model')
const axios = require('axios')


       
const zoomHeaders={
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    } 
const createAppointment = async(appointmentData,user,zoomMeetID,paymentID) =>{
    return new Promise(async(resolve,reject)=>{
console.log("Creating Appointment")
        const saveData ={
            studentID:user._id,
            meetID:zoomMeetID,
            ...appointmentData
        }
        console.log("saveData",saveData)
        try {
            const newAppointment = await Appointment.create(saveData)
            
             return resolve(newAppointment)
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
}
const patchAppointment = async(appointmentID,updateData) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            const appointmentData = await Appointment.findByIdAndUpdate({_id:appointmentID},updateData,{new:true})
            console.log("appointmentData",appointmentData);
             return resolve({success:true,appointmentData})
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
}

const getDates=(viewName,currentDate)=>{
    var curr = new Date(currentDate);
    var firstday;
    var lastday;
    switch (viewName) {
        case 'Week':
              var first = curr.getDate() - curr.getDay()+1; // First day is the day of the month - the day of the week
                var last = first + 6; // last day is the first day + 6
                firstday = new Date(curr.setDate(first));
                lastday = new Date(curr.setDate(last));
            break;
        case 'Month':
                firstday=  new Date(curr.getFullYear(), curr.getMonth(), 1);
               lastday = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
            break;
    
        default:
            firstday=new Date(curr.setHours(0,0,0,0))
            lastday=new Date(curr.setHours(23,59,59,999))
            break;
    }
  
    return {firstday,lastday}

}

const getAppointment = async(viewName="Week",currentDate=new Date()) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            const {firstday,lastday}=getDates(viewName,currentDate)
            console.log("fistDate",firstday.toLocaleString())
            console.log("lastday",lastday.toLocaleString())
            const appointmentData = await Appointment.find({startDate:{$gte:firstday},endDate:{$lte:lastday}}).populate("studentID",'name').populate('teacherID','name')
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
const createMeet = async(zoomToken,meetMetaData) =>{
      return new Promise(async(resolve,reject)=>{
        try {
           
    const createMeetUrl= "https://api.zoom.us/v2/users/me/meetings"
    const body={
      topic: meetMetaData.title,
      type: 1,
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    }
      
            const response = await axios.post(createMeetUrl,body,{headers:{Authorization:`Bearer ${zoomToken}`,...zoomHeaders}})
            try {
                const zoomData =await ZoomData.create(response.data)
                return resolve(zoomData)
            } catch (error) {
                if(error) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
            }
             
        } catch (err) {
             if(err) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
        }

    })
  
}

const deleteAppointment=async(meetingID,zoomToken,paymentIntentID,stripe)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const deleteMeetUrl = `https://api.zoom.us/v2/meetings/${meetingID}`
            const meetResponse = await axios.delete(deleteMeetUrl,{headers:{Authorization:`Bearer ${zoomToken}`,...zoomHeaders}})
            if(meetResponse.status===204){
                 await stripe.refunds.create({
                    payment_intent: paymentIntentID,
                    amount: process.env.PAYMENT_AMOUNT,
                });
                const zoomData = await ZoomData.deleteOne({id:meetingID})
                const appointmentResponse = await Appointment.deleteOne()
                //console.log("appointmentResponse",appointmentResponse)
              
                return resolve({successs:true,response:{zoomData,appointmentResponse}})
            }
            return reject({statusCode:httpStatus.CONFLICT})
        } catch (error) {
             if(error) return reject({statusCode:httpStatus.CONFLICT,message:error.message})
        }
    })
}


const createPayment =async(paymentIntent)=>{
    return new Promise(async(resolve,reject)=>{
         try {
                 const paymentData = await Payment.create(paymentIntent)
                return resolve(paymentData)
            } catch (error) {
                if(error) return reject({statusCode:httpStatus.CONFLICT,message:err.message})
            }
      
    })
}

module.exports = {
    createAppointment,
    getAppointment,
    getTeacherList,
    createMeet,
    patchAppointment,
    createPayment,
    deleteAppointment
};
