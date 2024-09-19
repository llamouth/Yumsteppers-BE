const express = require("express");
const restaurants = express.Router();
const { getAllRestaurants } = require('../queries/restaurants');

restaurants.get("/",  async (req, res) => {
    try {
        const allRestaurants = await getAllRestaurants()
        res.status(200).json(allRestaurants)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = restaurants;