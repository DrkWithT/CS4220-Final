import express from 'express';
import {MongoDB} from '../services/db.js';

const HistoryRouter = express.Router();

/**
 * @description Reformats data objects from db into name-value pairs.
 * @param {{strMeal: string, idMeal: any}[]} meals 
 * @returns {{name: string, value: any}[]}
 */
const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {name : `${meal.strMeal}`, value: meal.idMeal};
    });
};

HistoryRouter.get('/', async (req, res) => {
    const mongoUtility = new MongoDB(process.env['DB_USER'], process.env['DB_PASSWORD'], process.env['DB_HOST'], process.env['DB_NAME'])

    try{
        const { query } = req;
        const { mealId } = query;

        let previousMeal;

        if(mealId) {
            const cursor = await mongoUtility.find('search_history', mealId);
            previousMeal = await cursor.next();
        } else {
            const cursor = await mongoUtility.find('search_history');
            previousMeal = await cursor.toArray();
        }

        const result = _formatMeals(previousMeal);

        res.json(result);
    } catch (err){
        res.status(500).json({ err });
    } finally {
        mongoUtility.close();
    }
});

export default HistoryRouter;
