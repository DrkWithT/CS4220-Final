import express from 'express';

import mongo from './services/db.js';
import search from './routes/search.js'

const PORT = 8080;

// creating Express application instance
const app = express();

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
