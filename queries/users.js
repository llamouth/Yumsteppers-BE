const db = require('../db/dbConfig');

const getAllUsers = async () => {
    try{
        const allUsers = await db.any("SELECT * FROM users")
        return allUsers
    }
  catch(error){
    return error
 }

}

const getOneUser = async (id) => {
    try {
        const oneUser = await db.one("SELECT * FROM users WHERE id=$1", id)
        return oneUser
    } catch (error) {
        return error
    }
}

const createUser = async (user) => {
    try {
        const newUser = await db.one(
            "INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned)) VALUES ($1, $2, $3, $4, $5, $6,) RETURNING *", 
            [
                user.username, 
                user.email, 
                user.password_hash, 
                user.latitude, 
                user.longitude, 
                user.points_earned
            ]
        )
        return newuser
    } catch (error) {
        return error  
    }
}

const deleteUser = async (id) => {
    try {
        const deletedUser= await db.one("DELETE FROM users WHERE id=$1 RETURNING *", id)
        return deletedUser
    } catch (error) {
        return error
    }
}

const updateUser = async (id, newInfo) => {
    try{
        const updatedInfo = await db.one{"UPDATE users SET name=$1, =$2, location=$3, age=$4, main_diet=$5, power=$6, is_dangerous=$7, date_documented=$8 WHERE id=$9 RETURNING *",
            [

        }
    }
}
module.exports = {getAllUsers,getOneUser,createUser,deleteUser,}