const db = require('../db/dbConfig');

const getAllRestaurants =  async () => {
    try {
        const allRestaurants = await db.any('SELECT * FROM restaurants')
        return allRestaurants
    } catch (error) {
        return error
    }
}

module.exports = { getAllRestaurants}