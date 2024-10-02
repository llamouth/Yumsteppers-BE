const request = require('supertest');
const express = require('express');
const app = require("../app");
const {
    getAllRestaurants,
    getOneRestaurant,
    addRestaurant,
    updateRestaurantInformation,
    deleteRestaurant } = require("../queries/restaurants");

jest.mock('../queries/restaurants');


const mockRestaurant = {
    id: 3,
    name: "test restaurant",
    latitude: '52.465658383',
    longitude: '39.928273747',
};

describe("Restaurants", () => {
    it("Should provide an array of objects with restaurant information from the database", async () => {

        getAllRestaurants.mockResolvedValue([mockRestaurant]);

        const response = await request(app).get('/restaurants');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([mockRestaurant]);

        response.body.forEach(restaurant => {
            expect(typeof restaurant).toBe("object");
            expect(restaurant).toHaveProperty("id");
            expect(restaurant).toHaveProperty("name");
            expect(restaurant).toHaveProperty("latitude");
            expect(restaurant).toHaveProperty("longitude");
        });
    });

    it("Should return a 500 error when there is a server error", async () => {
        getAllRestaurants.mockRejectedValue(new Error("Server error"));

        const response = await request(app).get('/restaurants');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Database error, no restaurants were retrieved from the database.");
    });

    it("Should provide an object with details of one specified restaurant", async () => {
        getOneRestaurant.mockResolvedValue(mockRestaurant);

        const response = await request(app).get("/restaurants/5");

        expect(response.statusCode).toBe(200);
        expect(typeof response.body).toBe("object");


        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("latitude");
        expect(response.body).toHaveProperty("longitude");
    });

    // it('Should return 500 when the restaurant is not found', async () => {
    //     const error = {
    //         name: "QueryResultError"
    //     };

    //     getOneRestaurant.mockResolvedValue(error.name);

    //     const response = await request(app).get('/restaurants/0');
    //     console.log(response)

    //     expect(response.status).toBe(500);
    //     expect(response.body).toHaveProperty("message", "This id doesnt exist for a restauarant");
    // });

    it("Should add a restaurant to the database and return a 201 status", async () => {

        const newRestaurant = {
            name: "new restaurant",
            latitude: '51.465658383',
            longitude: '38.928273747',
        };

        addRestaurant.mockResolvedValue(newRestaurant);

        const response = await request(app)
            .post('/restaurants')
            .send(newRestaurant)
            .expect(201);

        expect(response.body).toEqual({
            Message: "New restaurant has been added to the list of available restaurants",
            restaurant: newRestaurant,
        });

        expect(addRestaurant).toHaveBeenCalledWith(newRestaurant);


        expect(typeof newRestaurant).toBe("object");
        expect(newRestaurant).toHaveProperty("name", expect.any(String));
        expect(newRestaurant).toHaveProperty("latitude", expect.any(String));
        expect(newRestaurant).toHaveProperty("longitude", expect.any(String));
    });

    it('should return 500 and an error message if adding the restaurant fails', async () => {
        const errorMessage = 'Failed to add restaurant';

        addRestaurant.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
            .post('/restaurants')
            .send({ name: 'Test Restaurant' })
            .expect(500);

        expect(response.body).toEqual({
            Message: 'Failed to add restaurant',
            error: errorMessage
        });
    });

    it("Should update restaurant information in the database", async () => {
        const mockUpdatedRestaurant = {
            id: 3,
            name: 'Updated Restaurant',
            latitude: "59.730610",
            longitude: "-53.935242"
        };

        updateRestaurantInformation.mockResolvedValue(mockUpdatedRestaurant);

        const res = await request(app)
            .put('/restaurants/3')
            .send({
                name: 'Updated Restaurant',
                latitude: "59.730610",
                longitude: "-53.935242"
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('Message', 'Restaurant database has been successfully updated');
        expect(res.body.restaurant).toEqual(mockUpdatedRestaurant);

        expect(typeof mockUpdatedRestaurant).toBe("object");
        expect(mockUpdatedRestaurant).toHaveProperty("name", expect.any(String));
        expect(mockUpdatedRestaurant).toHaveProperty("latitude", expect.any(String));
        expect(mockUpdatedRestaurant).toHaveProperty("longitude", expect.any(String));
    });

    it('should return a 404 if restaurant ID is not found', async () => {
        updateRestaurantInformation.mockResolvedValue({});

        const res = await request(app)
            .put('/restaurants/999')
            .send({
                name: 'Nonexistent Restaurant',
                address: '123 Nowhere St.',
                cuisine: 'Unknown',
            });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'Restaurant ID:999 Can Not Be Found');
    });

    it("should delete a restaurant and return a success message when restaurant exists", async () => {

        deleteRestaurant.mockResolvedValue(mockRestaurant);

        const response = await request(app).delete(`/restaurants/${mockRestaurant.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: `The restaurant called "${mockRestaurant.name}" has been removed.`,
        });
    });

    it("should return 404 error when restaurant does not exist", async () => {
        const restaurantId = "999";

        deleteRestaurant.mockResolvedValue({});

        const response = await request(app).delete(`/restaurants/${restaurantId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: `Restaurant ID:${restaurantId} Can Not Be Found`,
        });
    });
});
