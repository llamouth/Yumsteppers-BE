const express = require('express')
const { getAllRewards, getSingleReward, createReward, deleteReward, updateReward } = require('../queries/rewards')
const { rewardSchema } = require('../validations/rewardValidation')
const rewards = express.Router()

rewards.get('/', async (req, res) => {
    try {
        const allRewards = await getAllRewards()
        res.status(200).json(allRewards)
    } catch (error) {
        res.status(500).json(error)
    }
})

rewards.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const singleReward = await getSingleReward(id)
        res.status(200).json(singleReward)
    } catch (error) {
        res.status(500).json(error)
    }
})

 rewards.post('/', async (req, res) => {
    const { error } = rewardSchema.validate(req.body)
    
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    try {
        const newReward = await createReward(req.body)
        res.status(200).json(newReward)
    } catch (error) {
        res.status(500).json(error)
    }
 })

 rewards.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const removedReward = await deleteReward(id)
        res.status(200).json(removedReward)
    } catch (error) {
        res.status(500).json(error)
    }
 })

 rewards.put('/:id', async (req, res) => {
    const { id } = req.params
    const { error } = rewardSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    try {
        const updatedReward = await updateReward(id, req.body)
        res.status(200).json(updatedReward)
    } catch (error) {
        res.status(500).json(error)
    }
 })

module.exports = rewards;