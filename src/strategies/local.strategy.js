const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/user.model")

//Called during login/sign up.
//passport.use(new LocalStrategy(User.createStrategy()))
passport.use(User.createStrategy());



//called while after logging in / signing up to set user details in req.user

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());