const { getAllRestaurants, getOneRestaurant } = require("../queries/restaurants");

const restaurant = {
    id: 1,
    name: "test restaurant",
    latitude: 52.00000,
    longitude: 49.0000,
}

describe("Restaurants", () => {
    it("Should provide an array of objects with restaurant information that is within the database", async () => {

        const result = await getAllRestaurants();
        // console.log("Result:", result);
        expect(Array.isArray(result)).toBe(true);
        result.forEach(restaurant => {
            expect(typeof restaurant).toBe("object");
            expect(restaurant).toHaveProperty("id");
            expect(restaurant).toHaveProperty("name");
            expect(restaurant).toHaveProperty("latitude");
            expect(restaurant).toHaveProperty("longitude");
        });
    });
    
    it("Should throw an error message if unable to fetch ANY restaurants", async () => {
        try {
            await getAllRestaurants();
        } catch (error) {
            expect(error.message).toBe("Unable to fetch restaurants from database");
        }
    });

    it("Should provide an object with details of one specified restaurant from the database", async () => {
       
        
        const result = await getOneRestaurant(restaurant.id);
        // console.log("Result:", result);
        // expect(typeof num).toBe("number")
        // result.id

        expect(typeof result).toBe("object");
        expect(typeof result.id).toBe("number");


        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("latitude");
        expect(result).toHaveProperty("longitude");
    });

    it("Should throw an error message if unable to fetch specified restaurant within the database", async () => {
        try {
            await getOneRestaurant(restaurant.id);
        } catch (error) {
            expect(error.message).toBe("Unable to fetch specified restaurant from database");
        }
    });

});