const httpStatus = require('http-status');
const tokenService = require('./token.service');
const passport = require("passport")
const jwt = require("jsonwebtoken")
const {User} =require('../models')
const ApiError = require('../utils/ApiError');

const {getAccessToken, COOKIE_OPTIONS, getRefreshToken,verifyUser} = tokenService

const passportAuthenticationPromise = async (req, res) => {
   return new Promise((resolve,reject)=>{
        passport.authenticate('local', (err, user, info) =>{
    if (err) return reject({statusCode:httpStatus.UNAUTHORIZED,message:'Error occured while Login'})
    if (!user) return reject({statusCode:httpStatus.UNAUTHORIZED,message:info.message})

    req.logIn(user, async(err)=>{
      if (err) return reject({statusCode:httpStatus.UNAUTHORIZED,message:err})       
        // Get Tokens
        const accessToken = getAccessToken({ _id: req.user._id })
        const refreshToken = getRefreshToken({ _id: req.user._id })
    
        // Save new generated token to db
        const userData = await User.findById(req.user._id)
        userData.refreshToken.push({refreshToken})
        try {
            await userData.save()
            //Create a cookie and send response token 
        res.cookie("refreshToken",refreshToken,COOKIE_OPTIONS)
        return resolve({success:true,token:accessToken,role:userData.role})
        } catch (error) {
          console.log("err",error)
           return reject({statusCode:httpStatus.SERVICE_UNAVAILABLE,success:false,errorMessage:'Error occured while saving data'})
        }
        
        
    });
  })(req, res);
    })
};

const passportRegistrationPromise =async(body) =>{
    return new Promise((resolve,reject) =>{
        User.register(
            new User(body),body.password,
            async(err,user)=>{
                //user.name = req.body.name
                if(err) return reject({statusCode:httpStatus.CONFLICT,message:"Email already exist"})
                const accessToken = getAccessToken({ _id: user._id })
                const refreshToken = getRefreshToken({ _id: user._id })
                user.refreshToken.push({ refreshToken })
                
                try {
                     await user.save()
                    
                        return resolve({success:true,refreshToken,token:accessToken})
                } 
                catch (error) {
        
       reject({statusCode:httpStatus.SERVICE_UNAVAILABLE,errorMessage:error.message})
    
                       
                    }
            }
        )
    })
}

const logout = async (userId,refreshToken) => {
    User.findById(userId).then(
    user => {
      const tokenIndex = user.refreshToken.findIndex(
        item => item.refreshToken === refreshToken
      )

      if (tokenIndex !== -1) {
        user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
      }

      user.save((err, user) => {
        if (err) {
          return err
        } else {
          return true
        }
      })
    },
    err => {return err}
  )
};

const refreshAuth = async (refreshToken) => {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const userId = payload._id
    
    return new Promise(async(resolve,reject)=>{
        try {
        User.findById(userId).then(user=>{
             if (user) {
            // Find the refresh token against the user record in database
            const tokenIndex = user.refreshToken.findIndex(
              item => item.refreshToken === refreshToken
            )
             if (tokenIndex === -1) {
              return reject({statusCode:httpStatus.NOT_FOUND,message:"Token Not Found"})
            } 
            const accessToken = getAccessToken({ _id: userId })
            
            // If the refresh token exists, then create new one and replace it.
            const newRefreshToken = getRefreshToken({ _id: userId })
            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }

            user.save((err)=>{
                if (err)  return reject({statusCode:httpStatus.SERVICE_UNAVAILABLE,message:'Error occured while saving data'})
                return resolve({newRefreshToken,accessToken,userData:user})
            })
             }
             else{

                 return reject({statusCode:httpStatus.UNAUTHORIZED,message:"Please Authenticate Again"})
             }
        })
    } catch (error) {
        return reject({statusCode:httpStatus.UNAUTHORIZED,message:"Token unavaliable in Database"})
    }
    })
};
const resetPassword = async (resetPasswordToken, newPassword) => {
    try {
        const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
        const user = await userService.getUserById(resetPasswordTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await userService.updateUserById(user.id, { password: newPassword });
        await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
};

const verifyEmail = async (verifyEmailToken) => {
    try {
        const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
        const user = await userService.getUserById(verifyEmailTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
        await userService.updateUserById(user.id, { isEmailVerified: true });
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
};

const profileUpdate=async(userID,newData)=>{
  try {
    const user=await User.findByIdAndUpdate(userID,newData,{new:true})
  console.log('user',user)
    return({success:true,user})
  } catch (error) {
    console.log("error",error.name)
    if(error.name==="MongoServerError"){
      throw new ApiError(httpStatus.CONFLICT, "This data already exist");

    }else{

      throw new ApiError(httpStatus.CONFLICT, error.message);
    }
  }
}

module.exports = {
    passportAuthenticationPromise,
    passportRegistrationPromise,
    logout,
    refreshAuth,
    resetPassword,
    verifyEmail,
    profileUpdate
};
