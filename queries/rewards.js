const { v4: uuidv4 } = require('uuid')
const {db} = require('../db/dbConfig')
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
        console.log(error)
        return error
    }
}

const createReward = async (reward) => {
    try {
        const {date_generated, details, expiration_date, user_id, restaurant_id, points_required } = reward

        const secret = uuidv4()

        reward.secret = secret

        const qrGenerated = await QRCode.toDataURL(JSON.stringify(reward))
        
        const newReward = await db.one('INSERT INTO rewards (qr_code, date_generated, details, expiration_date, user_id, restaurant_id, points_required) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [ qrGenerated, date_generated || new Date(), details, expiration_date, user_id, restaurant_id, points_required])
        return newReward
    } catch (error) {
        console.log(error)
        return error
    }
}

const updateReward = async ( id, reward ) => {
    try {
        const { date_generated, details, expiration_date, user_id, restaurant_id, points_required } = reward

        const existingReward = await db.one('SELECT date_generated FROM rewards WHERE id=$1', [id])

        const dateGeneratedToUpdate = date_generated || existingReward.date_generated

        const qrGenerated = await QRCode.toDataURL(JSON.stringify(reward))

        const updatedReward = await db.one('UPDATE rewards SET qr_code=$1, date_generated=$2, details=$3, expiration_date=$4, user_id=$5, restaurant_id=$6, points_required=$7 WHERE id=$8 RETURNING *', [qrGenerated, dateGeneratedToUpdate, details, expiration_date, user_id, restaurant_id, points_required, id])
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