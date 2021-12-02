const router = require("express").Router()
const {tokenService} = require("../../services/")

const validate = require('../../middlewares/validate');
const {authValidation} = require('../../validations');
const {authController,userController} = require('../../controllers');
const { vUser } = require("../../controllers/user.controller");

router.post('/login', validate(authValidation.login),authController.login);
router.post('/signup', validate(authValidation.signup),authController.register);
router.post('/refreshToken', validate(authValidation.refreshTokens),authController.refreshTokens);
//router.get('/isAuthenticated')
//router.get("/me",userController.userData)


router.get("/logout",authController.logout)

module.exports = router