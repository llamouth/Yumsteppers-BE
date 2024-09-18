const db = require ('../db/dbConfig')


const getAllSteps = async(user_id) => {
    try {
        const allSteps = await db.any('SELECT * FROM steps WHERE user_id=$1', user_id)
    } catch (error) {
        error
    }
}


const getSteps = async (user_id, id) => {
    try {
        const oneSteps = await db.one('SELECT * FROM steps WHERE id=$1 AND user_id=$2', [id, user_id])
    } catch (error) {
        error
    }
}


const deleteSteps = async (user_id,id) => {
    try {
        const deletedSteps = await db.one('DELETE * FROM steps WHERE id=$1', [id,user_id])
    } catch (error) {
        
    }
}