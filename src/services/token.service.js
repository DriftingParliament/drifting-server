const passport = require("passport")
const jwt = require("jsonwebtoken")
const dev = process.env.NODE_ENV !== "production"
const httpStatus = require('http-status')
const ApiError =require('../utils/ApiError')


const COOKIE_OPTIONS = {
  httpOnly: true,
  // Since localhost is not having https protocol,
  // secure cookies do not work correctly (in postman)
  secure: !dev,
  signed: true,
  secret:process.env.JWT_SECRET,
  maxAge:60*60*24*30*1000,
  sameSite:"lax",
}

// For Expirer Time https://github.com/vercel/ms

const getAccessToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    
   expiresIn:eval(process.env.JWT_ACCESS_EXPIRATION_MINUTES)
   
  })
}

const getRefreshToken = user => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
 
    expiresIn:eval(process.env.JWT_REFRESH_EXPIRATION_DAYS)
    
  })
  return refreshToken
}


var verifyUser = function (req, res, next) {
   passport.authenticate('jwt',{session:true},(err,user,info)=>{
 
    if(err) return next(new ApiError(httpStatus.UNAUTHORIZED, err));
    if(!user) return next(new ApiError(httpStatus.UNAUTHORIZED, "Session expired please login again"));
    req.user = user
    return next()
   })(req,res,next)
}

/* const verifyUser = async(req,res,next)=>{
  return new Promise((resolve,reject)=>{
    passport.authenticate('jwt',{session:false},(err,user,info)=>{
  if(err) return reject({statusCode:httpStatus.UNAUTHORIZED,message:err})
  if(!user) return reject({statusCode:httpStatus.UNAUTHORIZED,message:"Session expired please login again"})
 
  return  resolve(user)
  })(req,res,next)
  })
} */

module.exports  ={COOKIE_OPTIONS,
getAccessToken,
getRefreshToken,
verifyUser,

}