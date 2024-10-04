const request = require('supertest');
const app = require("../app");
const {
    getAllRestaurants,
    getOneRestaurant,
    addRestaurant,
    updateRestaurantInformation,
    deleteRestaurant
} = require("../queries/restaurants");

jest.mock('../queries/restaurants');

const mockRestaurant = {
    id: 3,
    name: "test restaurant",
    latitude: '52.465658383',
    longitude: '39.928273747',
};

const newRestaurant = {
    name: "new restaurant",
    latitude: '51.465658383',
    longitude: '38.928273747',
};

describe("Restaurants ", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it("Should provide an array of restaurant objects", async () => {
        getAllRestaurants.mockResolvedValue([mockRestaurant]);

        const response = await request(app).get('/restaurants');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([mockRestaurant]);

        response.body.forEach(restaurant => {
            expect(restaurant).toMatchObject({
                id: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(String),
                longitude: expect.any(String),
            });
        });
    });

    it("Should return a 500 error when there is a server error", async () => {
        getAllRestaurants.mockRejectedValue(new Error("Server error"));

        const response = await request(app).get('/restaurants');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Database error, no restaurants were retrieved from the database."
        });
    });

    it("Should provide details of one specified restaurant", async () => {
        getOneRestaurant.mockResolvedValue(mockRestaurant);

        const response = await request(app).get("/restaurants/5");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRestaurant);
        expect(response.body).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            latitude: expect.any(String),
            longitude: expect.any(String),
        });
    });

    it("Should add a new restaurant and return a 201 status", async () => {
        addRestaurant.mockResolvedValue(newRestaurant);

        const response = await request(app)
            .post('/restaurants')
            .send(newRestaurant)
            .expect(201);

        expect(response.body).toEqual({
            message: "New restaurant has been added to the list of available restaurants",
            restaurant: newRestaurant,
        });

        expect(addRestaurant).toHaveBeenCalledWith(newRestaurant);
    });

    it("Should return 500 if adding a restaurant fails", async () => {
        const errorMessage = 'Failed to add restaurant';
        addRestaurant.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
            .post('/restaurants')
            .send({ name: 'Test Restaurant' })
            .expect(500);

        expect(response.body).toEqual({message: 'Failed to add restaurant.'});
    });

    it("Should update restaurant information", async () => {
        const updatedRestaurant = {
            id: 3,
            name: 'Updated Restaurant',
            latitude: "59.730610",
            longitude: "-53.935242"
        };

        updateRestaurantInformation.mockResolvedValue(updatedRestaurant);

        const response = await request(app)
            .put('/restaurants/3')
            .send(updatedRestaurant);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Restaurant database has been successfully updated",
            restaurant: updatedRestaurant
        });
    });

    it("Should return 404 if restaurant ID is not found", async () => {
        updateRestaurantInformation.mockResolvedValue({});

        const response = await request(app)
            .put('/restaurants/999')
            .send({
                name: 'Nonexistent Restaurant',
                latitude: '40.000000',
                longitude: '-100.000000',
            });
            console.log(response)

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: 'Restaurant ID: 999 cannot be found.'
        });
    });

    it("Should delete a restaurant successfully", async () => {
        deleteRestaurant.mockResolvedValue(mockRestaurant);

        const response = await request(app).delete(`/restaurants/${mockRestaurant.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: `The restaurant called "${mockRestaurant.name}" has been removed.`,
        });
    });

    it("Should return 404 error when deleting a non-existent restaurant", async () => {
        const restaurantId = "999";
        deleteRestaurant.mockResolvedValue(null);

        const response = await request(app).delete(`/restaurants/${restaurantId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: `Restaurant ID: ${restaurantId} cannot be found.`,
        });
    });
});
