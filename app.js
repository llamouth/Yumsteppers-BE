const express = require('express');
const app = express()
const cors = require('cors')
const usersController = require('./controllers/usersController')
const restaurantsController = require('./controllers/restaurantsControllers')
const checkinsController = require('./controllers/checkinsController')
const rewardsController = require('./controllers/rewardsController')
const googlePlacesController = require('./controllers/googlePlacesController')
const redemptionsController = require('./controllers/redmptionsController')

app.use(express.json())
app.use(cors())
app.use('/users', usersController) // STEPS CONTROLLER IS USED AS  MIDDLEWARE IN USRES 
app.use('/restaurants', restaurantsController)
app.use('/checkins', checkinsController)
app.use('/rewards', rewardsController)
app.use('/googlePlaces', googlePlacesController)
app.use('/redemptions', redemptionsController)

app.get('/', (req, res) => {
    res.status(200).json('Welcome to YUMstepper')
})

app.get('*', (req, res) => {
    res.status(404).json({ error: 'NOT FOUND'})
})

module.exports = app;