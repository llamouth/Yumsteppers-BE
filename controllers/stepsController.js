const express = require ('express')
const steps = express.Router({ mergeParams: true })
const {getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps} = require ('../queries/steps')

//localhost/3/steps
steps.get('/', async (req, res) => {
    const { user_id } = req.params 
    try { 
        const allSteps = await getAllSteps(user_id)
        res.json(allSteps)
        
    } catch (error) {
        res.status(500).json({error: 'Error steps could not be gotten'})
    }
})

steps.get('/:id', async (req,res) => {
    const { user_id, id } = req.params 
    try {
        const singleSteps = await getSingleStep(user_id,id)
        res.status(200).json(singleSteps)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Error could not get specific steps'})
    }
})

steps.delete('/:id', async (req,res) => {
    const {id} = req.params 
    try {
        const deletedSteps = await deleteSteps(id)
        
        res.status(200).json({message: 'Steps have been deleted'})
    } catch (error) {
        res.status(500).json({error: 'Error steps could not be deleted'})
    }
})


steps.put('/:id', async(req,res) => {
    try {
        const{ user_id, id } = req.params
        const updatedSteps = await updateSteps(user_id, id, req.body)
        res.status(200).json({message: 'Steps have been updated', steps: updatedSteps})
    } catch (error) {
        res.status(500).json({error: 'Error steps could not be updated'})
    }
})


steps.post('/', async (req,res) => {
    const {user_id} = req.params
    try{
        const newSteps = await createNewSteps(user_id, req.body)
        res.status(200).json({message: 'New steps have been created', steps: newSteps})
    }catch(error){
        res.status(500).json({error: 'Error New steps could not be created'})
    }
   
})










module.exports = steps