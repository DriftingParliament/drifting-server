const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
//const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
require("dotenv").config();

const jwtOptions = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
};
//console.log("TOKEN", ExtractJwt.fromAuthHeaderAsBearerToken());
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
    jwtStrategy,
};
