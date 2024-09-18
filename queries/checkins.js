const db = require('../db/dbConfig')

const getAllCheckins = async () => {
    try {
        const allCheckins = await db.any('SELECT * FROM checkins')
        return allCheckins
    } catch (error) {
        return error
    }
}

const getSingleCheckin = async (id) => {
    try {
        const singleCheckin = await db.one('SELECT * FROM checkins WHERE id=$1', id)
        return singleCheckin
    } catch (error) {
        return error
    }
}

const createCheckin = async (checkin) => {
    try {
        const newCheckin = await db.one('INSERT INTO checkins (date, restaurant_id, user_id, receipt_image) VALUES($1, $2, $3, $4) RETURNING *')
        return newCheckin
    } catch (error) {
        return error
    }
}

module.exports = { getAllCheckins, getSingleCheckin, createCheckin }