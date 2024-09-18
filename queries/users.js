const db = require('../db/dbConfig');
const bcrypt = require('bcrypt')

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
        const salt = 10
        const hashedPassword = await bcrypt.hash(user.password_hash, salt)
        const newUser = await db.one(
            "INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES ($1, $2, $3, $4, $5, $6,) RETURNING *", 
            [
                user.username, 
                user.email, 
                hashedPassword, 
                user.latitude, 
                user.longitude, 
                user.points_earned
            ] 
        )
        return newUser
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
        const currentUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id)

        const passwordMatch = newInfo.password_hash == currentUser.password_hash
        let updatedInfo ;
        
        if(passwordMatch) {
            updatedInfo = await db.one("UPDATE users SET username=$1, email=$2, password_hash=$3, latitude=$4, longitude=$5, points_earned=$6 WHERE id=$7 RETURNING *",
                [
                newInfo.username, 
                newInfo.email, 
                newInfo.password_hash, 
                newInfo.latitude, 
                newInfo.longitude, 
                newInfo.points_earned
                ])
        }else {
            const salt = 10
            const hashedPassword = await bcrypt.hash(newInfo.password_hash, salt)
            updatedInfo = await db.one("UPDATE users SET username=$1, email=$2, password_hash=$3, latitude=$4, longitude=$5, points_earned=$6 WHERE id=$7 RETURNING *",
            [
            newInfo.username, 
            newInfo.email, 
            hashedPassword, 
            newInfo.latitude, 
            newInfo.longitude, 
            newInfo.points_earned
            ])
        }
          return updatedInfo  

        }catch(error) {

        }
    }

module.exports = {getAllUsers,getOneUser,createUser,deleteUser, updateUser}