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
        next(new ApiError(error.statusCode, error.message));
    }
});


const login = catchAsync(async (req, res,next) => {
    try {

       const response = await authService.passportAuthenticationPromise(req,res)
       console.log("Loging User ")
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
    console.log("user,",refreshToken)
    const response = await authService.logout(userId,refreshToken)
       console.log("res",response);
        res.clearCookie("refreshToken", COOKIE_OPTIONS)
       return res.status(httpStatus.OK).send({success:true,...response})
    } catch (error) {
        next(new ApiError(httpStatus.UNAUTHORIZED, "Already Logged out"));
    }
});

const refreshTokens = catchAsync(async (req, res,next) => {
     const { signedCookies = {} } = req
     const { refreshToken } = signedCookies
    // console.log('signedCookies',signedCookies)
     //console.log('refreshToken',refreshToken)
     if(refreshToken){
        try {
            const response = await authService.refreshAuth(refreshToken)
           console.log("Refreshing TOken")
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
    await authService.resetPassword(req.query.token, req.body.password);
    res.status(httpStatus.NO_CONTENT).send();
});

/* const sendVerificationEmail = catchAsync(async (req, res) => {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
    await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
    res.status(httpStatus.NO_CONTENT).send();
}); */

const verifyEmail = catchAsync(async (req, res) => {
    await authService.verifyEmail(req.query.token);
    res.status(httpStatus.NO_CONTENT).send();
});

const sendTestEmail = catchAsync(async(req,res)=>{
    await emailService.testEmail()
    res.status(httpStatus.NO_CONTENT).send();
})



module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    //sendVerificationEmail,
    verifyEmail,
    sendTestEmail,

};