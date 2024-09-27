const { authenticateToken } = require("../auth/auth.js");
// // const request = require('supertest');
// const express = require('express');
// const jwt = require('jsonwebtoken');

// const app = express();
// app.use(express.json());

// test('should return 401 if no token is provided', async () => {
//     const response = await request(app).get('/protected');
//     expect(response.status).toBe(401);
//     expect(response.body).toEqual({ error: 'Access Denied. No token provided' });
// });

test('should return 200 for a valid token', async () => {
    const token = jwt.sign({ username: 'testUser' }, process.env.SECRET);
    const response = await request(app).get('/protected').set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Protected route accessed!', user: { username: 'testUser' } });
});