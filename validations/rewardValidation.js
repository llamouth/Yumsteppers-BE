const Joi = require('joi')

const rewardSchema = Joi.object({
    qr_code: Joi.string().required(),
    details: Joi.string().required(),
    expiration_date: Joi.date().greater('now').required(),
    restaurant_id: Joi.number().required(),
    points_required: Joi.number().min(0).required(),
});


module.exports = { rewardSchema }
