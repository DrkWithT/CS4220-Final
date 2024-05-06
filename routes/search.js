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

        const cursor = await mongo.find('search_history', searchTerm);
        const keyword = await cursor.next();

        const date = new Date();   
        
        res.json(entry);

        if(keyword === null){
                await mongo.create('search_history', {
                searchTerm: searchTerm,
                searchCount: result.length,
                lastSearched: date.toDateString() + ' ' + date.toLocaleTimeString('en-US')
            });
           console.log("Data successful stored in datatbase!");
        }
        else{
           await mongo.update('search_history', searchTerm, {
               searchTerm: searchTerm,
               searchCount: result.length,
               lastSearched: date.toDateString() + ' ' + date.toLocaleTimeString('en-US')  
           });
           console.log("Data successful updated in datatbase!");
        }
        
    } catch (err) {
        res.status(500).json({ err });
    }
});

export default router;