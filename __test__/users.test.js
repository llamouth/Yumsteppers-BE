const {getAllUsers,getOneUser,createUser,deleteUser, updateUser, loginUser}= require("../queries/users");
const request = require("supertest");
const app = require("../app");

jest.mock("../queries/users");

const mockUser = {
    // id: 5,
    username: "tester10", //NOT NULL,
    email: "tester10@gmail.com", //NOT NULL,
    password_hash: "hello", //NOT NULL,
    latitude: "61.01928373",
    longitude: "38.35242473",
    points_earned: 0 //NOT NULL
};

describe("Users", () => {

    // it("Should provide a 200 status with an array of objects with user information from the database", async () => {
    //     getAllUsers.mockResolvedValue([mockUser]);

    //     const response = await request(app).get("/users");

    //     expect(response.statusCode).toBe(200); 
    //     expect(Array.isArray(response.body)).toBe(true); 

    //     response.body.forEach(user => {
    //         expect(typeof user).toBe("object");
    //         expect(user).toHaveProperty("id");
    //         expect(user).toHaveProperty("username");
    //         expect(user).toHaveProperty("email");
    //         expect(user).toHaveProperty("password_hash");
    //         expect(user).toHaveProperty("latitude");
    //         expect(user).toHaveProperty("longitude");
    //         expect(user).toHaveProperty("points_earned");
    //     });

    // });

    // it("Should return a 500 status code when there is an error", async () => {
    //     getAllUsers.mockRejectedValue(new Error("Database error, no users were retrieved."));

    // const response = await request(app).get("/users");

    // expect(response.statusCode).toBe(500); 
    // expect(response.body).toHaveProperty("message", "Database error, no users were retrieved from the database."); 
    // });

    // it("Should provide an object with details of one specified user", async () => {
    //     const result = getOneUser.mockResolvedValue(mockUser);

    //     const response = await request(app).get("/users/5");

    //     expect(response.statusCode).toBe(200); 
    //     expect(typeof response.body).toBe("object");

        
    //     expect(response.body).toHaveProperty("id");
    //     expect(response.body).toHaveProperty("username");
    //     expect(response.body).toHaveProperty("email");
    //     expect(response.body).toHaveProperty("password_hash");
    //     expect(response.body).toHaveProperty("latitude");
    //     expect(response.body).toHaveProperty("longitude");
    //     expect(response.body).toHaveProperty("points_earned");
    // });

    // it('Should return 404 when the user is not found', async () => {
    //     getOneUser.mockResolvedValue({});
    
    //     const response = await request(app).get('/users/999'); 
        
    //     expect(response.status).toBe(404);
    //     expect(response.body).toEqual({ error: 'Stepper Not Found' });
    //   });

    it("Should add a user to the database and return a token", async () => {
        // createUser.mockResolvedValue(mockUser);
        
        const response = await request(app)
        .post('/users')
        .send({
            username: 'tester1',
            email: 'tester1@gmail.com',
            password_hash: 'plain_password',
            // latitude: '62.01928373',
            // longitude: '39.35242473',
            // points_earned: 0,
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('newUser');
        expect(response.body.newUser).toEqual(mockUser);
        expect(response.body).toHaveProperty('token');

    });

    // it('should return an error if user creation fails', async () => {
    //     createUser.mockRejectedValue(new Error('User creation failed'));

    //     const response = await request(app)
    //         .post('/users')
    //         .send({
    //             username: 'tester1',
    //             email: 'tester1@gmail.com',
    //             password_hash: 'plain_password',
    //             // latitude: '62.01928373',
    //             // longitude: '39.35242473',
    //             // points_earned: 0,
    //         });

    //     expect(response.status).toBe(500);
    //     expect(response.body).toHaveProperty('error', 'User creation failed'); 
    // });

    // it("Should update restaurant information in the database", async () => {
    //     const result = await updateUser(mockUser.id, mockUser);

    //     expect(typeof mockUser).toBe("object");
    //     expect(result).toHaveProperty("id", expect.any(Number));
    //     expect(result).toHaveProperty("username", expect.any(String));
    //     expect(result).toHaveProperty("email", expect.any(String));
    //     expect(result).toHaveProperty("password_hash", expect.any(String));
    //     expect(result).toHaveProperty("latitude", expect.any(String));
    //     expect(result).toHaveProperty("longitude", expect.any(String));
    //     expect(result).toHaveProperty("points_earned", expect.any(Number));
    // });

    // it("Should return an error when unable to update user information", async () => {
    //     try {
    //         await updateUser(mockUser.id, mockUser);
    //     } catch (error) {
    //         expect(error.message).toBe("Unable to update user information within the database");
    //     }
    // });

    // it("Should delete user information in the database", async () => {
    //     const result = await deleteUser(mockUser.id);

    //     expect(typeof mockUser.id).toBe("number");
    //     // expect(typeof result).toBe("object");
    
    // });

    // it("Should return an error when unable to delete user information", async () => {
    //     try {
    //         await deleteUser(mockUser.id);
            
    //     } catch (error) {
    //         expect(error.message).toBe("Unable to delete specified user from database");
    //     }
    // });
});