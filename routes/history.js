import express from 'express';
import mongo from '../server/db.js';

const router = express.Router();

const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {name : `${meal.strMeal}`, value: meal.idMeal};
    });
};

router.get('/', async (req, res) => {
    try{
        const { query } = req;
        const { mealId } = query;

        let previousMeal;

        if(mealId){
            const cursor = await mongo.find('searchHistory', mealId);
            const previousMeal = await cursor.next();
            return previousMeal;
        }
        else {
            const cursor = await mongo.find('searchHistory');
            const previousMeal = await cursor.toArray();
            return previousMeal;
        }

        const result = _formatMeals(previousMeal);


        res.json(result);
    }
    catch (err){
        res.status(500).json({ err });
    }
});

export default router;