const Joi = require('joi')

const rewardSchema = Joi.object({
    date_generated: Joi.date().optional(),
    details: Joi.string().min(3).required(),
    expiration_date: Joi.date().greater('now').required(),
    user_id: Joi.number().integer().positive().optional(),
    restaurant_id: Joi.number().integer().positive().required(),
    points_required: Joi.number().integer().positive().required()
})

module.exports = { rewardSchema }
