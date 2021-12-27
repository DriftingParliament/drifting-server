const router = require("express").Router()
const { appointment } = require("../../controllers");
const validate = require('../../middlewares/validate');
const { verifyUser, verifyZoomToken } = require("../../services/token.service");
const {appointmentValidation} = require('../../validations');

//router.post("/", validate(appointmentValidation.create),verifyUser,verifyZoomToken, appointment.createAppointment)
router.post("/", verifyUser,verifyZoomToken, appointment.createAppointment)
router.get("/",verifyUser, appointment.getAppointment)
router.delete("/:id",verifyUser,verifyZoomToken, appointment.deleteAppointment)
router.patch("/:id",verifyUser, appointment.patchAppointment)
router.get("/getTeachersList",verifyUser, appointment.getTeacherList)
router.post("/create-payment-intent",verifyUser, appointment.checkout)
//router.post("/createMeet",verifyUser,verifyZoomToken,appointment.createMeet)
/* router.post("/signature", validate(appointmentValidation.signature),verifyUser, appointment.signature) */

module.exports = router