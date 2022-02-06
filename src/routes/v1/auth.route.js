const router = require("express").Router()

const validate = require('../../middlewares/validate');
const {authValidation} = require('../../validations');
const {authController} = require('../../controllers');
const { verifyUser } = require("../../services/token.service");

router.post('/login', validate(authValidation.login),authController.login);
router.post('/signup', validate(authValidation.signup),authController.register);
//router.post('/refreshToken', validate(authValidation.refreshTokens),authController.refreshTokens);
router.get('/refreshToken', validate(authValidation.refreshTokens),authController.refreshTokens);
router.patch('/profile-update/:id',verifyUser, authController.profileUpdate);
router.post("/reset-password/", verifyUser,authController.resetPassword);


router.post("/logout",authController.logout)

module.exports = router