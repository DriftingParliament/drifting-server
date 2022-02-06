const httpStatus = require('http-status');
const jwt = require("jsonwebtoken")
const catchAsync = require('../utils/catchAsync');
const { authService,  tokenService, emailService } = require('../services');


const ApiError =require('../utils/ApiError')

const { COOKIE_OPTIONS} = tokenService

const register = catchAsync(async (req, res,next) => {  
    try {
       const response = await authService.passportRegistrationPromise(req.body)
       res.cookie("refreshToken",response.refreshToken,COOKIE_OPTIONS)
       return res.status(httpStatus.OK).send({success:true,token:response.token})
    } catch (error) {
    //    console.log('resister',error.message)
        next(new ApiError(error.statusCode, error.message));
    }
});


const login = catchAsync(async (req, res,next) => {
    try {

       const response = await authService.passportAuthenticationPromise(req,res)
      // console.log("Loging User ")
       return res.status(httpStatus.OK).send({...response})
    } catch (error) {
        next(new ApiError(error.statusCode, error.message));
    }
});

const logout = catchAsync(async (req, res,next) => {
  try {
     const { signedCookies = {} } = req
    const { refreshToken } = signedCookies   
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const userId = payload._id
    //console.log("user,",refreshToken)
    const response = await authService.logout(userId,refreshToken)
      // console.log("res",response);
        res.clearCookie("refreshToken", COOKIE_OPTIONS)
       return res.status(httpStatus.OK).send({success:true,...response})
    } catch (error) {
        next(new ApiError(httpStatus.UNAUTHORIZED, "Already Logged out"));
    }
});

const refreshTokens = catchAsync(async (req, res,next) => {
     const { signedCookies = {} } = req
     const { refreshToken } = signedCookies
    /*  console.log('signedCookies',signedCookies)
     console.log('refreshToken',refreshToken) */
     if(refreshToken){
        try {
            const response = await authService.refreshAuth(refreshToken)
         //  console.log("Refreshing TOken")
            res.cookie("refreshToken", response.newRefreshToken, COOKIE_OPTIONS)
            return res.status(httpStatus.OK).send({success:true,token:response.accessToken,role:response.userData.role})
            }
        catch (error) {
                next(new ApiError(error.statusCode, error.message));
            }
     }else{
          next(new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate"));
     }
   
    
});

const forgotPassword = catchAsync(async (req, res) => {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
    await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
    const response = await req.user.changePassword(
      req.body.currentPassword,
      req.body.newPassword
    );
        
     //   console.log("respos",response)
   res.status(httpStatus.OK).send({success:true,response})
});

const profileUpdate=catchAsync(async(req,res,next)=>{
  /*   console.log("uid",req.params.id)
    console.log("datta",req.body) */
    const userID=req.params.id
    const newData=req.body
    
    const response=await authService.profileUpdate(userID,newData)
    //console.log("respos",response)

return  res.status(httpStatus.OK).send(response);
})


module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
  profileUpdate

};