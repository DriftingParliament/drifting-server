const router = require('express').Router()
//const authRoute = require('./auth.route')
const authRoute=require("./auth.route")
const appointmentRoute=require("./appointment.route")
const paymentRoute=require("./payment.route")


const defaultRoutes = [
    {
        path:'/auth',
        route:authRoute
    },
    {
        path:'/appointment',
        route:appointmentRoute
    }
    ,
    {
        path:'/payment',
        route:paymentRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;