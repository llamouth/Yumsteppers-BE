const pgp = require("pg-promise")()
require("dotenv").config()

const cn = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
}

const db = pgp(cn)
const googleMapsAPIKey = process.env.GOOGLE_API_KEY
const yelpAPIKey = process.env.YELP_API_KEY;

console.log('google ' + googleMapsAPIKey)
module.exports = { db, googleMapsAPIKey, yelpAPIKey }

