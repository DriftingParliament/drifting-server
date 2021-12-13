const router = require("express").Router()
const { appointment } = require("../../controllers");
const validate = require('../../middlewares/validate');
const { verifyUser } = require("../../services/token.service");
const {appointmentValidation} = require('../../validations');

router.post("/create", validate(appointmentValidation.create),verifyUser, appointment.createAppointment)
router.get("/get",verifyUser, appointment.getAppointment)
router.get("/getTeachersList",verifyUser, appointment.getTeacherList)
router.post("/checkout",verifyUser, appointment.checkout)
/* router.post("/signature", validate(appointmentValidation.signature),verifyUser, appointment.signature) */

module.exports = router