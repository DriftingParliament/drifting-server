const router = require("express").Router()
const { appointment } = require("../../controllers");

const { verifyUser, verifyZoomToken } = require("../../services/token.service");

//router.post("/", validate(appointmentValidation.create),verifyUser,verifyZoomToken, appointment.createAppointment)
router.post("/", verifyUser,verifyZoomToken, appointment.createAppointment)
router.get("/",verifyUser, appointment.getAppointment)
router.post("/studentUpdate", verifyUser, appointment.studentUpdate)
router.post("/studentUpdateNP", verifyUser, appointment.studentUpdateNoPayment)
router.delete("/:id",verifyUser,verifyZoomToken, appointment.deleteAppointment)
router.patch("/:id",verifyUser, appointment.patchAppointment)
router.get("/getUserByRole/:role",verifyUser, appointment.getUserByRole)
//router.get("/getStudentList",verifyUser, appointment.getStudentList)
//router.post("/create-payment-intent",verifyUser, appointment.checkout)

router.get('/meetings',verifyUser,appointment.meetings)
router.get("/data", verifyUser, appointment.appointmentStats);
//router.post("/createMeet",verifyUser,verifyZoomToken,appointment.createMeet)
/* router.post("/signature", validate(appointmentValidation.signature),verifyUser, appointment.signature) */

//Temp
//router.get("/generateZoomToken",verifyUser, generateZoomToken)

module.exports = router