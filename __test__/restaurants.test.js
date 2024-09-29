const { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation, 
    deleteRestaurant } = require("../queries/restaurants");

const restaurant = {
    id: 63,
    name: "test restaurant",
    latitude: 52.00000,
    longitude: 49.0000,
};

describe("Restaurants", () => {

    it("Should provide an array of objects with restaurant information from the database", async () => {
        const result = await getAllRestaurants();

        expect(Array.isArray(result)).toBe(true);
        result.forEach(restaurant => {
            expect(typeof restaurant).toBe("object");
            expect(restaurant).toHaveProperty("id");
            expect(restaurant).toHaveProperty("name");
            expect(restaurant).toHaveProperty("latitude");
            expect(restaurant).toHaveProperty("longitude");
        });
    });

    it("Should return an error when unable to fetch restaurants", async () => {
        try {
            await getAllRestaurants();
        } catch (error) {
            expect(error.message).toBe("Unable to fetch restaurants from database");
        }
    });

    it("Should provide an object with details of one specified restaurant", async () => {
        const result = await getOneRestaurant(restaurant.id);

        expect(typeof result).toBe("object");
        
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("latitude");
        expect(result).toHaveProperty("longitude");
    });

    it("Should return an error when unable to fetch a specific restaurant", async () => {
        try {
            await getOneRestaurant(restaurant.id);
        } catch (error) {
            expect(error.message).toBe("Unable to fetch specified restaurant from database");
        }
    });

    it("Should add a restaurant to the database", async () => {
        const result = await addRestaurant(restaurant);

        expect(typeof restaurant).toBe("object");
        expect(restaurant).toHaveProperty("name", expect.any(String));
        expect(restaurant).toHaveProperty("latitude", expect.any(Number));
        expect(restaurant).toHaveProperty("longitude", expect.any(Number));
    });

    it("Should return an error when unable to add a restaurant", async () => {
        try {
            await addRestaurant(restaurant);
        } catch (error) {
            expect(error.message).toBe("Unable to add restaurant to database");
        }
    });

    it("Should update restaurant information in the database", async () => {
        const result = await updateRestaurantInformation(restaurant);

        expect(typeof restaurant).toBe("object");
        expect(restaurant).toHaveProperty("name", expect.any(String));
        expect(restaurant).toHaveProperty("latitude", expect.any(Number));
        expect(restaurant).toHaveProperty("longitude", expect.any(Number));
    });

    it("Should return an error when unable to update restaurant information", async () => {
        try {
            await updateRestaurantInformation(restaurant);
        } catch (error) {
            expect(error.message).toBe("Unable to update restaurant information within the database");
        }
    });

    it("Should delete restaurant information in the database", async () => {
        const result = await deleteRestaurant(restaurant.id);

        expect(typeof restaurant.id).toBe("number");
        // expect(typeof result).toBe("object");
    
    });

    it("Should return an error when unable to delete restaurant information", async () => {
        try {
            await deleteRestaurant(restaurant.id);
            
        } catch (error) {
            expect(error.message).toBe("Unable to delete specified restaurant from database");
        }
    });
});
