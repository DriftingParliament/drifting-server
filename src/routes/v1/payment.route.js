const router = require("express").Router()
const { payment } = require("../../controllers");
const { verifyUser} = require("../../services/token.service");
//router.post("/", validate(appointmentValidation.create),verifyUser,verifyZoomToken, appointment.createAppointment)
//router.post("/", verifyUser, appointment.createAppointment)
router.get("/getAll",verifyUser, payment.getAll)
router.post("/create-payment-intent", verifyUser, payment.createPaymentIntent);
router.post("/refund/:paymentIntentId",verifyUser, payment.refund)
router.get(
  "/payment-status/:paymentIntent",
  verifyUser,
  payment.paymentStatus
);
router.get("/publishable-key",  payment.publishableKey);
module.exports = router