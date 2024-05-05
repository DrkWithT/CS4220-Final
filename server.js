import express from 'express';
import MongoDB from './services/db.js';
import dotenv from 'dotenv';
import search from './routes/search.js'

const PORT = 8080;

// creating Express application instance
const app = express();

dotenv.config();
const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME} = process.env;

// Instantiate a new MongoDB 
// loading in the .env and passing in env variables
const mongo = new MongoDB(`${DB_USER}`, `${DB_PASSWORD}`, `${DB_HOST}`, `${DB_NAME}`);

// GET route to handle requests to the root URL (localhost:8080)
app.get('/', (req, res) => {
    res.send('Welcome to the The Meal DB API App');
});

// mounting the 'search' router to handle requests starting with '/search'
app.use('/search', search);

// starting the server and connecting to MongoDB
app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);
    await mongo.connect();
});
