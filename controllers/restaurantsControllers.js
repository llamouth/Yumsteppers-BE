const express = require("express");
const restaurants = express.Router();

restaurants.get("/", (req, res) => {
    res.status(200).json({Good: " heyyy you made it to a restaurant!"})
})

module.exports = restaurants;