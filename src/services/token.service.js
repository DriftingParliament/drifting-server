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
  sameSite:dev?"lax":"none",
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

var generateZoomToken =()=>{
  const payload = {
    iss:  process.env.ZOOM_JWT_API_KEY,
    exp: new Date().getTime() + 5000,
  };
  const token = jwt.sign(payload, process.env.ZOOM_JWT_API_SECRET); 
  //console.log("Generating Zoom Token",token)
  return token
}
var verifyZoomToken = (req,res,next)=>{
  const { signedCookies = {} } = req
  let { zoomToken } = signedCookies
   if(!zoomToken){
      zoomToken= generateZoomToken()
    //  console.log('zoomToken',zoomToken)
      res.cookie("zoomToken",zoomToken,COOKIE_OPTIONS)
      req.zoomToken=zoomToken
      next()
   }
   else{
     try {
  var decoded = jwt.verify(zoomToken,process.env.ZOOM_JWT_API_SECRET);
    if(decoded){
       next()
    }
} catch(err) {
  if(err) return next(new ApiError(httpStatus.UNAUTHORIZED, err));
}
   }

(req,res,next)
}

module.exports  ={COOKIE_OPTIONS,
getAccessToken,
getRefreshToken,
verifyUser,
generateZoomToken,
verifyZoomToken
}