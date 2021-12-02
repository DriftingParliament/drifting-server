const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService } = require('../services');
const passport=require('passport')
const ApiError =require('../utils/ApiError')



const userData = catchAsync(async(req,res,next)=>{
     try {
        const users = await tokenService.verifyUser(req,res,next)
        console.log("users",users);
        req.user = users
        return res.status(httpStatus.OK).send({success:true,user:req.user})
    } catch (error) {
        console.log("errrrrrr",error);
        next(new ApiError(error.statusCode, error.message));
    }
})
exports.vUser = passport.authenticate("jwt", { session: false })
module.exports = {
    userData
}