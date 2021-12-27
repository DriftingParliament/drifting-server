const Joi = require('joi');

const create={
    body:Joi.object().keys({
        teacherID:Joi.string().required(),
        title:Joi.string().required(),
        notes:Joi.string().required(),
        allDay:Joi.boolean(),
        location:Joi.string(),
        startDate: Joi.date().required(),
        endDate:Joi.date().required()
    })
}
const signature={
    body:Joi.object().keys({
        meetingNumber :Joi.string().required(),
        role:Joi.number().required(),
    })
}

module.exports = {
   create,signature
};