const Joi = require('joi');
const login = {
    body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
};
const signup = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string()
    }),
};

const refreshTokens = {
    signedCookies: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

module.exports = {
    login,signup,refreshTokens

};