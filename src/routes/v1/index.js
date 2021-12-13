const router = require('express').Router()
//const authRoute = require('./auth.route')
const authRoute=require("./auth.route")
const appointmentRoute=require("./appointment.route")


const defaultRoutes = [
    {
        path:'/auth',
        route:authRoute
    },
    {
        path:'/appointment',
        route:appointmentRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;