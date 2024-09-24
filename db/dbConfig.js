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
const googleMapsAPIKey = process.env.GOOGLE_MAPS_API_KEY

module.exports = { db, googleMapsAPIKey }