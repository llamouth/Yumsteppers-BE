const db = require ('../db/dbConfig')


const getAllSteps = async(user_id) => {
    try {
        const allSteps = await db.any('SELECT * FROM steps WHERE user_id=$1', user_id)
        return allSteps
    } catch (error) {
        error
    }
}


const getSingleStep = async (user_id, id) => {
    try {
        const oneStep = await db.one('SELECT * FROM steps WHERE id=$1 AND user_id=$2', [id, user_id])
        return oneStep
    } catch (error) {
        error
    }
}


const deleteSteps = async (id) => {
    try {
        const deletedSteps = await db.one('DELETE * FROM steps WHERE id=$1', [id])
        return deletedSteps
    } catch (error) {
        
    }
}

module.exports = {getAllSteps, getSingleStep, deleteSteps }