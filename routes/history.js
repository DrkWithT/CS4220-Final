import express from 'express';
import mongo from '../services/db.js';

/**
 * @description Express router with search history functionality.
 */
const HistoryRouter = express.Router();

/**
 * @description Reformats data objects from db into name-value pairs.
 * @param {{strMeal: string, idMeal: any}[]} meals 
 * @returns {{name: string, value: any}[]}
 */
const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return { name: `${meal.strMeal}`, value: meal.idMeal };
    });
};

HistoryRouter.get('/', async (req, res) => {
    try {
        const { query } = req;
        const { mealId } = query; // earlier search keyword if any

        let previousMeal;

        if (mealId) {
            const cursor = await mongo.find('search_history', mealId);
            previousMeal = await cursor.next();
        } else {
            const cursor = await mongo.find('search_history');
            previousMeal = await cursor.toArray();
        }

        // Restructure the JS object parsed from MongoDB query result.
        const result = _formatMeals(previousMeal);

        /// @note We give response with its set headers lastly after all throwable calls to ensure no double header setting error on any throw.
        res.json(result);

    } catch (err) {
        res.status(500).json({ err });
    }
});

export default HistoryRouter;
