import express from 'express';
import * as api from '../services/api.js';
import mongo from '../services/db.js';

const router = express.Router();

const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {
            mealId: `${meal.idMeal}`, 
            name : `${meal.strMeal}`
        };
    });
};

/**
 * GET request for '/search' endpoint
 * @description Searches by serchTerm, displays all the meals with the searchTerm and caves the results of the searchTerm in the MongoDB
 */
router.get('/', async (req, res) => {
    try {
        const { query } = req;
        const { searchTerm } = query;

        const mealQuery = await api.searchByName(searchTerm);

        const result = _formatMeals(mealQuery.meals);
        const entry = { result };

        res.json(entry);

        if(!searchTerm){
            await mongo.create('search_history', {
                searchterm: searchTerm,
                searchCount: result.length(),
                lastSearched: Date.now()
            });

            console.log("Data successful stored in datatbase!");
        }
        else{
            await mongo.update('search_history', {
                searchterm: searchTerm,
                searchCount: result.length(),
                lastSearched: Date.now()
            });
        } 
  
    } catch (err) {
        res.status(500).json({ err });
    }
});


export default router;