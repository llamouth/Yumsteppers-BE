const express = require("express");
const users = express.Router();
const stepsController = require('../controllers/stepsController');
const { authenticateToken } = require("../auth/auth")
const {getAllUsers,getOneUser,createUser,deleteUser, updateUser}= require('../queries/users');

users.use('/:user_id/steps', authenticateToken, stepsController);

users.get('/', async (req, res) => {
    try {
        const allUsers = await getAllUsers() 
        res.status(200).json(allUsers)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = users;