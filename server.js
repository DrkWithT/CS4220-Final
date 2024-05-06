/**
 * @file server.js
 * @course CS 4220 Spring 2024
 * @author "Derek's Group"
 * @note Reference from Stack Overflow for nodemon signal handle: // https://stackoverflow.com/questions/60490250/graceful-shutdown-with-nodemon-and-express
 */

import express from 'express';

import mongo from './services/db.js';
import SearchRouter from './routes/search.js';
import HistoryRouter from './routes/history.js';

/* Constants */

const PORT = 8080;

/* Application */

// Create Express application instance
const app = express();

// Handle GET requests to the root URL (test with localhost:8080)
app.get('/', (req, res) => {
    res.send('Welcome to the "The Meal DB API" App');
});

// Mount routers for API search, prompt history...
app.use('/search', SearchRouter);
app.use('/history', HistoryRouter);

// starting the server and connecting to MongoDB
const appServer = app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);
    await mongo.connect();
});

const onHaltingSignal = (event) => {
    console.log('Stopping app, closing server.');
    appServer.close( async (err) => {
        if (err) {
            console.error(`server.js [Error]: ${err}`);
            return;
        }

        await mongo.close();
    });
};

/* graceful shutdown handlers */

// Use event handler for manual Ctrl+C signal.
process.on('SIGINT', onHaltingSignal);

// Use event handlers for nodemon signals
process.on('SIGTERM', onHaltingSignal);
process.on('SIGUSR2', onHaltingSignal);
