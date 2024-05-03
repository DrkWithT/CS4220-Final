import express from 'express';
import * as api from '../services/api.js';
/// TODO: Fix unused import!
// import MongoDB from '../services/db.js';

const router = express.Router();

const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {mealId: `${meal.idMeal}`, name : `${meal.strMeal}`};
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

        const date = new Date.now();
        console.log(date.toLocaleString());

        const result = _formatMeals(mealQuery.meals);
        const entry = { result };

        /// TODO: complete & fix search functionality?
        // if(!searchTerm){
        //     const date = new Date().now()

        //     await MongoDB.create('search_history', {
        //         searchterm: searchTerm,
        //         searchCount: entry.length(),
        //         lastSearched: date
        //     });
        // }
        // else{

        //     const date = new Date().now()

        //     await MongoDB.update('search_history', {
        //         searchterm: searchTerm,
        //         searchCount: result.length(),
        //         lastSearched: date
        //     });
        // } 
        
        res.json(entry);
  
    } catch (err) {
        res.status(500).json({ err });
    }
});


export default router;