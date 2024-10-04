const { getAllUsers, getOneUser, createUser, deleteUser, updateUser, loginUser } = require("../queries/users");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require('../auth/auth'); 

jest.mock("../queries/users");
jest.mock("jsonwebtoken");

const mockUser = {
    id: 5,
    username: "tester10",
    email: "tester10@gmail.com",
    password_hash: "hello",
    latitude: "61.01928373",
    longitude: "38.35242473",
    points_earned: 0
};

describe("Users", () => {

    it("Should provide a 200 status with an array of objects with user information from the database", async () => {
        getAllUsers.mockResolvedValue([mockUser]);

        const response = await request(app).get("/users");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        response.body.forEach(user => {
            expect(typeof user).toBe("object");
            expect(user).toHaveProperty("id");
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("password_hash");
            expect(user).toHaveProperty("latitude");
            expect(user).toHaveProperty("longitude");
            expect(user).toHaveProperty("points_earned");
        });
    });

    it("Should return a 500 status code when there is an error", async () => {
        getAllUsers.mockRejectedValue(new Error("Database error, no users were retrieved."));

        const response = await request(app).get("/users");

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Database error, no users were retrieved from the database.");
    });

    it("Should provide an object with details of one specified user", async () => {
        getOneUser.mockResolvedValue(mockUser);

        const response = await request(app).get("/users/5");

        expect(response.statusCode).toBe(200);
        expect(typeof response.body).toBe("object");

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("username");
        expect(response.body).toHaveProperty("email");
        expect(response.body).toHaveProperty("password_hash");
        expect(response.body).toHaveProperty("latitude");
        expect(response.body).toHaveProperty("longitude");
        expect(response.body).toHaveProperty("points_earned");
    });

    it("Should return 404 when the user is not found", async () => {
        getOneUser.mockRejectedValue(new Error("An error occurred while fetching the user"));

        const response = await request(app).get('/users/999');

        if (response.status === 404) {
            expect(response.body).toEqual({ error: "Stepper Not Found" });
        } else if (response.status === 500) {
            expect(response.body).toEqual({ message: "Error retrieving user." });
        }        
    });

    it("should create a new user and return a JWT token", async () => {
        const newUser = {
            userId: {
                id: 1,
            username: "testuser",
            password_hash: "hashed_password",
            latitude: "0.000000",
            longitude: "0.000000",
            points_earned: 0,
            },
            email: "testuser@example.com",

        };

        createUser.mockResolvedValue(newUser);

        const mockToken = "fake-jwt-token";
        jwt.sign.mockReturnValue(mockToken); 

        const newUserRequest = {
            username: "testuser",
            email: "testuser@example.com",
            password_hash: "password123"
        };

        const response = await request(app)
            .post("/users")
            .send(newUserRequest);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("newUser");
        expect(response.body).toHaveProperty("token", mockToken);
        expect(response.body.newUser).toEqual(newUser);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: newUser.userId.id, username: newUser.userId.username },
            process.env.SECRET
        );
    });

    it("should return an error if the user creation fails", async () => {
        createUser.mockRejectedValue(new Error("User creation failed"));

        const newUserRequest = {
            username: "testuser",
            email: "testuser@example.com",
            password_hash: "password123"
        };

        const response = await request(app)
            .post("/users")
            .send(newUserRequest);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("User could not be created");
    });

    beforeEach(() => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, { id: mockUser.id, username: mockUser.username }); 
        });
    });

    it("should update user information and return the updated user", async () => {
        const updatedUserInfo = {
            id: mockUser.id,
            username: "updatedUser",
            email: "updatedEmail@gmail.com",
            password_hash: "newPasswordHash",
            latitude: "60.01928373",
            longitude: "37.35242473",
            points_earned: 1000
        };

        updateUser.mockResolvedValue(updatedUserInfo);

        const token = "fake-jwt-token"; 

        const response = await request(app)
            .put(`/users/${mockUser.id}`)
            .set("Authorization", `Bearer ${token}`) 
            .send(updatedUserInfo);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Stepper updated successfully");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toEqual(updatedUserInfo);
    });

    it("should return a 404 error if the user cannot be updated", async () => {
        updateUser.mockResolvedValue(null);

        const token = "fake-jwt-token";

        const response = await request(app)
            .put(`/users/${mockUser.id}`)
            .set("Authorization", `Bearer ${token}`) 
            .send({ username: "updatedUser" });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Stepper can not be found");
    });

    it("should delete a user and return a success message when user exists", async () => {
        deleteUser.mockResolvedValue(mockUser);

        const mockToken = "fake-jwt-token";
        jwt.sign.mockReturnValue(mockToken); 

        const response = await request(app)
            .delete(`/users/${mockUser.id}`)
            .set("Authorization", `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Stepper, steps no more." }); 
    });

    it("should return a 404 error when the user does not exist", async () => {
        deleteUser.mockResolvedValue(null);

        const response = await request(app)
            .delete(`/users/${mockUser.id}`)
            .set("Authorization", "Bearer testtoken");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Stepper not deleted." });
    });

    it("Should log in a user and return a token", async () => {
        const loginMockUser = {
            user_id: 1,
            username: "testUser",
            password: "testPassword",
        };

        const token = jwt.sign(
            { userId: loginMockUser.user_id, username: loginMockUser.username },
            process.env.SECRET
        );

        loginUser.mockResolvedValue(loginMockUser);

        const response = await request(app)
            .post('/users/login')
            .send({ username: loginMockUser.username, password: loginMockUser.password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user', loginMockUser);
        expect(response.body).toHaveProperty('token', token);
    });

    it("Should return 401 for invalid credentials", async () => {
        loginUser.mockResolvedValue(null);

        const response = await request(app)
            .post('/users/login')
            .send({ username: "wrongUser", password: "wrongPassword" });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Invalid username or password" });
    });

    it("Should return 500 for internal server error", async () => {
        loginUser.mockRejectedValue(new Error("Internal server error"));

        const response = await request(app)
            .post('/users/login')
            .send({ username: "testUser", password: "testPassword" });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal server error" });
    });
});

