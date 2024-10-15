const app = require('./app')
require('dotenv').config()

const PORT = process.env.PORT

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on port: ${PORT}`)
})