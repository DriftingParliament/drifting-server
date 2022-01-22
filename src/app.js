const express = require('express')
const helmet = require('helmet')
const cors = require('cors');
//const passport = require('passport');
const httpStatus = require('http-status');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser =require('cookie-parser')
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError')
const passport = require('passport');
const { vUser } = require('./controllers/user.controller');
//const { jwtStrategy } = require('./config/passport');

require('./strategies');
require('./services');

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

//cookie secret
app.use(cookieParser(process.env.COOKIE_SECRET))


// enable cors
const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors());

// for jwt authentication
app.use(passport.initialize());
app.use(passport.session());
//passport.use('jwt', jwtStrategy);
 


// v1 api routes
app.use('/v1', routes);
app.get("/", function (req, res) {
  res.send({ status: "success" })
})
app.get("/v1/auth/me", passport.authenticate('jwt', { session: false }),function (req, res) {
  res.send({ success:true,user:req.user })
})
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
