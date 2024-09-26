const {db} = require ('../db/dbConfig')


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
        const oneStep = await db.one('SELECT * FROM steps WHERE id=$1', [id])
        return oneStep
    } catch (error) {
        return error
    }
}

const deleteSteps = async (id) => {
    try {
        const deletedSteps = await db.one('DELETE * FROM steps WHERE id=$1 RETURNING *', [id])
        return deletedSteps
    } catch (error) {
        return error
    }
}

const updateSteps = async (user_id, id, steps) => {
    try {
        const { step_count, date } = steps
        const updatedSteps = await db.one('UPDATE steps SET step_count=$1, date=$2, user_id=$3 WHERE id=$4 RETURNING *', [step_count, date, user_id, id])
        return updatedSteps
    } catch (error) {
       return  error
    }
}


const createNewSteps = async (user_id, steps) =>{
    const {step_count} = steps
    try{
    const newSteps = await db.one('INSERT INTO steps( step_count, user_id ) VALUES($1, $2) RETURNING *', [step_count, user_id])
    return newSteps
    } catch (error) {
        return error
    }
}


module.exports = {getAllSteps, getSingleStep, deleteSteps, updateSteps,createNewSteps }