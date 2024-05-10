import express from 'express';
import mongo from '../services/db.js';

const HistoryRouter = express.Router();

// GET localhost:8080/history endpoint
HistoryRouter.get('/', async (req, res) => {
    try {
        const { searchTerm } = req.query;

        // Retrieve search history from the database
        let historyData;
        if (searchTerm) {
            // If searchTerm is provided, filter search history by searchTerm
            historyData = await mongo.find('search_history', 'searchTerm',searchTerm);
        } else {
            // If no searchTerm is provided, retrieve all search history
            historyData = await mongo.find('search_history');
        }

        // Send JSON response with search history data
        res.json(await historyData.toArray());
    } catch (err) {
        // If an error occurs, send an error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default HistoryRouter;
