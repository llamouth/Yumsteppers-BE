const {getAllUsers,getOneUser,createUser,deleteUser, updateUser, loginUser}= require("../queries/users");


const mockUser = {
    id: 14,
    username: "tester1", //NOT NULL,
    email: "tester1@gmail.com", //NOT NULL,
    password_hash: "92q7r73y7y17y1ge", //NOT NULL,
    latitude: "62.01928373",
    longitude: "39.35242473",
    points_earned: 0 //NOT NULL
};

describe("Users", () => {

    it("Should provide an array of objects with user information from the database", async () => {
        const result = await getAllUsers();

        expect(Array.isArray(result)).toBe(true);
        result.forEach(user => {
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

    it("Should return an error when unable to fetch users", async () => {
        try {
            await getAllUsers();
        } catch (error) {
            expect(error.message).toBe("Unable to fetch ANY users from the database");
        }
    });

    it("Should provide an object with details of one specified user", async () => {
        const result = await getOneUser(mockUser.id);

        expect(typeof result).toBe("object");
        
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("username");
        expect(result).toHaveProperty("email");
        expect(result).toHaveProperty("password_hash");
        expect(result).toHaveProperty("latitude");
        expect(result).toHaveProperty("longitude");
        expect(result).toHaveProperty("points_earned");
    });

    it("Should return an error when unable to fetch a specific user", async () => {
        try {
            await getOneUser(mockUser.id);
        } catch (error) {
            expect(error.message).toBe("Unable to fetch specified user from database");
        }
    });

    it("Should add a user to the database", async () => {
        
        const result = await createUser(mockUser);

        expect(typeof mockUser).toBe("object");
        expect(result).toHaveProperty("id", expect.any(Number));
        expect(result).toHaveProperty("username", expect.any(String));
        expect(result).toHaveProperty("email", expect.any(String));
        expect(result).toHaveProperty("password_hash", expect.any(String));
        expect(result).toHaveProperty("latitude", expect.any(String));
        expect(result).toHaveProperty("longitude", expect.any(String));
        expect(result).toHaveProperty("points_earned", expect.any(Number));

    });

    it("Should return an error when unable to add a user", async () => {
        try {
            await createUser(mockUser);
        } catch (error) {
            expect(error.message).toBe("Unable to add user to database");
        }
    });

    it("Should update restaurant information in the database", async () => {
        const result = await updateUser(mockUser.id, mockUser);

        expect(typeof mockUser).toBe("object");
        expect(result).toHaveProperty("id", expect.any(Number));
        expect(result).toHaveProperty("username", expect.any(String));
        expect(result).toHaveProperty("email", expect.any(String));
        expect(result).toHaveProperty("password_hash", expect.any(String));
        expect(result).toHaveProperty("latitude", expect.any(String));
        expect(result).toHaveProperty("longitude", expect.any(String));
        expect(result).toHaveProperty("points_earned", expect.any(Number));
    });

    it("Should return an error when unable to update user information", async () => {
        try {
            await updateUser(mockUser.id, mockUser);
        } catch (error) {
            expect(error.message).toBe("Unable to update user information within the database");
        }
    });

    it("Should delete user information in the database", async () => {
        const result = await deleteUser(mockUser.id);

        expect(typeof mockUser.id).toBe("number");
        // expect(typeof result).toBe("object");
    
    });

    it("Should return an error when unable to delete user information", async () => {
        try {
            await deleteUser(mockUser.id);
            
        } catch (error) {
            expect(error.message).toBe("Unable to delete specified user from database");
        }
    });
});