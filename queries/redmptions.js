const {db} = require('../db/dbConfig')

const getAllRedemptions = async () => {
    try {
        const allRedemptions = db.manyOrNone('SELECT * FROM redemptions')
        return allRedemptions
    } catch (error) {
        return error
    }
}

const getSingleRedemption = async ( id ) => {
    try {
        const singleRedemption = await db.oneOrNone('SELECT * FROM redemptions WHERE id=$1', id)
        return singleRedemption
    } catch (error) {
        return error
    }
}

const createRedemption = async ( redemption ) => {
    try {
        
    } catch (error) {
        return error
    }
}
module.exports = { getAllRedemptions, getSingleRedemption }