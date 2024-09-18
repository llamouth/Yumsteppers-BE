const express = require('express')
const checkins = express.Router()
const { getAllCheckins, getSingleCheckin } = require('../queries/checkins')

checkins.get('/', async ( req, res ) => {
    try {
        const allCheckins = await getAllCheckins()
        res.status(200).json(allCheckins)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = checkins