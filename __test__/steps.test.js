const { getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps } = require("../queries/steps");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
// const { authenticateToken } = require('../auth/auth'); 

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

    it('should return all steps for an authenticated user with status 200', async () => {
        // const mockSteps = [{ step: 'Step 1' }, { step: 'Step 2' }];
        getAllSteps.mockResolvedValue(mockStep.user_id); // Mock successful response

        const response = await request(app)
            .get('/users/1/steps')
            .set('Authorization', 'Bearer valid-token'); // Simulate the valid token

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockSteps);

        // Ensure each step has the correct properties
        response.body.forEach(step => {
            expect(typeof step).toBe("object");
            expect(step).toHaveProperty("id");
            expect(step).toHaveProperty("step_count");
            expect(step).toHaveProperty("date");
            expect(step).toHaveProperty("user_id");
        });
    });

    it('should return a 401 error for invalid token', async () => {
        const response = await request(app)
            .get('users/1/steps')
            .set('Authorization', 'Bearer invalid-token'); // Simulate invalid token

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({ error: 'Unauthorized' });
    });
});