const express = require ('express')
const steps = express.Router()

//localhost/3/steps
steps.get('/', async (req, res) => {
    const { user_id } = req.params

})









module.exports = steps