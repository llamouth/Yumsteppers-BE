const{ getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps } = require("../queries/steps");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require('../auth/auth'); 

jest.mock("../queries/steps");
jest.mock("jsonwebtoken");

const mockStep = {
    id: 5,
    step_count: 0,
    date: 12,
    user_id: 1
};


beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    jwt.verify.mockImplementation((token, secret, callback) => {
        if (token === "valid-token") {
            callback(null, { userId: 1 }); // Simulate a valid user
        } else {
            callback(new Error("Invalid token"), null);
        }
    });
});

describe("Steps", () => {
    it("Should provide a 200 status with an array of objects with all steps of one user from the database", async () => {
        getAllSteps.mockResolvedValue([mockStep]);

        const mockToken = "valid-token"; // Define a mock token

    const response = await request(app)
        .get("/users/1/steps") // Use a specific user ID instead of ':id'
        .set("Authorization", `Bearer ${mockToken}`); // Set the Authorization header

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        response.body.forEach(user => {
            expect(typeof step).toBe("object");
            expect(step).toHaveProperty("id");
            expect(step).toHaveProperty("step_count");
            expect(step).toHaveProperty("date");
            expect(step).toHaveProperty("user_id");
        });
    });
});