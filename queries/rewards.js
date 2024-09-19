const db = require('../db/dbConfig')
const QRCode = require('qrcode')

const getAllRewards = async () => {
    try {
        const allRewards = await db.any('SELECT * FROM rewards')
        return allRewards
    } catch (error) {
        return error
    }
}

const getSingleReward = async (id) => {
    try {
        const singleReward = await db.one('SELECT * FROM rewards WHERE id=$1', id)
        return singleReward
    } catch (error) {
        return error
    }
}

const createReward = async (reward) => {
    try {
        const {date_generated, details, expiration_date, user_id, restaurant_id } = reward

        const qrGenerated = await QRCode.toDataURL(JSON.stringify(reward))
        
        const newReward = await db.one('INSERT INTO rewards (qr_code, date_generated, details, expiration_date, user_id, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [ qrGenerated, date_generated || new Date(), details, expiration_date, user_id, restaurant_id])
        return newReward
    } catch (error) {
        console.log(error)
        return error
    }
}

const updateReward = async ( id, reward ) => {
    try {
        const { date_generated, details, expiration_date, user_id, restaurant_id } = reward

        const qrGenerated = await QRCode.toDataURL(JSON.stringify(reward))

        const updatedReward = await db.one('UPDATE rewards SET qr_code=$1, date_generated=$2, details=$3, expiration_date=$4, user_id=$5, restaurant_id=$6 WHERE id=$7 RETURNING *', [qrGenerated, date_generated, details, expiration_date, user_id, restaurant_id, id])
        return updatedReward
    } catch (error) {
        return error
    }

}

const deleteReward = async ( id ) => {
    try {
        const removedReward = await db.one('DELETE FROM rewards WHERE id=$1 RETURNING *', id)
        return removedReward
    } catch (error) {
        return error
    }
}

module.exports = { getAllRewards, getSingleReward, createReward, deleteReward, updateReward }