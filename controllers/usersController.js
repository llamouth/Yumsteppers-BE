const express = require("express");
const users = express.Router();
const stepsController = require('../controllers/stepsController');

users.use('/:user_id/steps', stepsController);

module.exports = users;