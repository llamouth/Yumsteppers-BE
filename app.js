const express = require('express');
const app = express()
const cors = require('cors')
// const bodyParser = require('body-parser');
const usersController = require('./controllers/usersController')
const restaurantsController = require('./controllers/restaurantsControllers')
const checkinsController = require('./controllers/checkinsController')
const rewardsController = require('./controllers/rewardsController')
const stepsController = require('./controllers/stepsController')
const googlePlacesController = require('./controllers/googlePlacesController')

// app.use(bodyParser.json());
app.use(express.json())
app.use(cors())
app.use('/users', usersController)
app.use('/users/:user_id/steps', stepsController)
app.use('/restaurants', restaurantsController)
app.use('/checkins', checkinsController)
app.use('/rewards', rewardsController)
app.use('/googlePlaces', googlePlacesController)

app.get('/', (req, res) => {
    res.status(200).json({message: 'Welcome to YUMstepper'})
})

app.get('*', (req, res) => {
    res.status(404).json({ error: 'NOT FOUND'})
})

module.exports = app;