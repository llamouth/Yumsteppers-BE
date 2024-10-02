const express = require("express");
const restaurants = express.Router();
const { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation,
    deleteRestaurant 
} = require('../queries/restaurants');

restaurants.get("/",  async (req, res) => {
    try {
        const allRestaurants = await getAllRestaurants()
        res.status(200).json(allRestaurants);
    } catch (error) {
        res.status(500).json({message: "Database error, no restaurants were retrieved from the database."});
    }
});

restaurants.get('/:id', async (req, res) => {
    const { id } = req.params;
    const oneRestaurant = await getOneRestaurant(id);
    if (oneRestaurant) {
        res.status(200).json(oneRestaurant);
    } else if(oneRestaurant.name === "QueryResultError"){
        res.status(500).json({ error: `This id doesnt exist for a restauarant `});
    }
});

restaurants.post("/", async (req, res) => {
    try {
        const addNewRestaurant = await addRestaurant(req.body);
        res.status(201).json({
            Message: "New restaurant has been added to the list of available restaurants",
            restaurant: addNewRestaurant
        });
    } catch (error) {
        console.error("Error adding restaurant:", error);
        res.status(500).json({ Message: "Failed to add restaurant", error: error.message });
    }
});


restaurants.put("/:id", async (req,res)=>{
    const newInfo = req.body;
    const { id } = req.params;
    const updateRestaurantInfo = await updateRestaurantInformation({id, ...newInfo});
    if(updateRestaurantInfo.id){
        res.status(200).json({Message: "Restaurant database has been successfully updated", restaurant:updateRestaurantInfo });
    }else{
        res.status(404).json({ error: `Restaurant ID:${id} Can Not Be Found` });
    }
});

restaurants.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const deletedRestaurant = await deleteRestaurant(id);
    
    if(deletedRestaurant.id) {
        res.status(200).json({ message: `The restaurant called "${deletedRestaurant.name}" has been removed.` });
    } else {
        res.status(404).json( {error: `Restaurant ID:${id} Can Not Be Found`});
    }
});

module.exports = restaurants;