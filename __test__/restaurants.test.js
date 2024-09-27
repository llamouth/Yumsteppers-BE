const { getAllRestaurants } = require("../queries/restaurants")

describe("Restaurants", () => {
    test("get an array of objects with restaurant information", async () => {

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
    
    test("should throw an error message if unable to fetch restaurants", async () => {
        try {
            await getAllRestaurants();
        } catch (error) {
            expect(error.message).toBe("Unable to fetch restaurants");
        }
    });

});