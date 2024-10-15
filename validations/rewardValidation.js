const Joi = require('joi')

const rewardSchema = Joi.object({
    date_generated: Joi.date().optional(),
    details: Joi.string().min(3).required(),
    expiration_date: Joi.date().greater('now').required(),
    restaurant_id: Joi.number().integer().positive().required()
})

module.exports = { rewardSchema }
