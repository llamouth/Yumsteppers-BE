const express = require('express');
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json('Welcome to Feasts')
})

module.exports = app;