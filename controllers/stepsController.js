const express = require ('express')
const steps = express.Router()

//localhost/3/steps
steps.get('/', async (req, res) => {
    const { user_id } = req.params 
    
})

steps.get('/:id', async (req,res) => {
    const { user_id, id } = req.params 
    try {
        
    } catch (error) {
        
    }
})










module.exports = steps