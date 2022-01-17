const router = require("express").Router()

const validate = require('../../middlewares/validate');
const {authValidation} = require('../../validations');
const {authController,userController} = require('../../controllers');

router.post('/login', validate(authValidation.login),authController.login);
router.post('/signup', validate(authValidation.signup),authController.register);
router.post('/refreshToken', validate(authValidation.refreshTokens),authController.refreshTokens);


router.get("/logout",authController.logout)

module.exports = router