const { db }= require('../db/dbConfig')
const { boroughsMap } = require('../utils/geoUtils')


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
        const singleCheckin = await db.oneOrNone('SELECT * FROM checkins WHERE id=$1', id)
        return singleCheckin
    } catch (error) {
        return error
    }
}

const createCheckin = async (checkin) => {
    const { restaurant_id, user_id, receipt_image, latitude, longitude } = checkin
    const locationCheck = boroughsMap(latitude, longitude)

    if(!locationCheck.valid) {
        return { error: locationCheck.message }
    }

    try {
        const newCheckin = await db.one('INSERT INTO checkins (restaurant_id, user_id, receipt_image, latitude, longitude) VALUES($1, $2, $3) RETURNING *', [ restaurant_id, user_id, receipt_image, latitude, longitude ]);
        return newCheckin
    } catch (error) {
        return error
    }
}

const deleteCheckin = async (id) => {
    try {
        const removedCheckin = await db.one('DELETE FROM checkins WHERE id=$1 RETURNING *', id)
        return removedCheckin
    } catch (error) {
        return error
    }
}

module.exports = { getAllCheckins, getSingleCheckin, createCheckin, deleteCheckin }