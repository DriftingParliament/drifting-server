const router = require("express").Router()
const { payment } = require("../../controllers");
const validate = require('../../middlewares/validate');
const { verifyUser} = require("../../services/token.service");
//router.post("/", validate(appointmentValidation.create),verifyUser,verifyZoomToken, appointment.createAppointment)
//router.post("/", verifyUser, appointment.createAppointment)
router.get("/getAll",verifyUser, payment.getAll)
router.post("/refund/:paymentIntentId",verifyUser, payment.refund)

module.exports = router