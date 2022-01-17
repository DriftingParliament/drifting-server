const router = require("express").Router()
const { payment } = require("../../controllers");
const validate = require('../../middlewares/validate');
const { verifyUser} = require("../../services/token.service");
//router.post("/", validate(appointmentValidation.create),verifyUser,verifyZoomToken, appointment.createAppointment)
//router.post("/", verifyUser, appointment.createAppointment)
router.get("/getAllPayments",verifyUser, payment.getAllPayments)

module.exports = router