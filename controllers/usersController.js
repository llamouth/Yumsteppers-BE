const express = require("express");
const users = express.Router();
const jwt = require('jsonwebtoken')
const secret = process.env.SECRET
const stepsController = require('../controllers/stepsController');
const { authenticateToken } = require("../auth/auth")
const {getAllUsers,getOneUser,createUser,deleteUser, updateUser, loginUser} = require('../queries/users');

//middleware 

users.use('/:user_id/steps', authenticateToken, stepsController);

users.get('/', async (req, res) => {
    try {
        const allUsers = await getAllUsers();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users.' });
    }
});


users.get('/:id', async (req, res)=>{

    const { id } = req.params;
    const oneUser = await getOneUser(id);
    if(oneUser.id){
        res.status(200).json(oneUser);
    }else{
        res.status(404).json({error: "Stepper Not Found"});
    }
})

users.post("/", async (req ,res) => {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser)
})

users.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params
    const deletedUserr = await deleteUser(id)
    
    if(deletedUserr.id) {
        res.status(200).json({ message: "Stepper, steps no more." })
    } else {
        res.status(404).json( {error: "Stepper not deleted." })
    }
})

users.put('/:id', authenticateToken, async (req,res)=>{
    const newInfo = req.body;
    const { id } = req.params;
    const updatedUserInfo = await updateUser(id, newInfo);
    console.log(updatedUserInfo)
    if(updatedUserInfo.id){
        res.status(200).json({ message: "Stepper updated successfully", user: updatedUserInfo });

    }else{
        res.status(404).json({ error: "Stepper can Not Be Found" });
    }
})

users.post("/login", async (req, res) => {
    try {
        const userLoggedIn = await loginUser(req.body);
        if(!userLoggedIn){
            res.status(401).json({ error: "Invalid username or password" })
            return 
        }

        console.log()
        const token = jwt.sign({ userId: userLoggedIn.user_id, username: userLoggedIn.username }, process.env.SECRET);

        const user = userLoggedIn

        res.status(200).json({ 
            user , 
            token 
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = users;