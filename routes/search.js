import express from 'express';
import * as api from '../services/api.js';
import mongo from '../services/db.js';

/**
 * @description Express router with Meal DB API search functionality.
 */
const SearchRouter = express.Router();

/**
 * @description Restructures an array of objects from a Meal DB API call.
 * @param {object[]} meals 
 * @returns {{mealId: string, name: string}[]} The reformatted data.
 */
const _formatMeals = (meals) => {
    return meals.map((meal) => {
        return {
            mealId: `${meal.idMeal}`, 
            name: `${meal.strMeal}`
        };
    });
};

/**
 * @description Handles `GET /search?searchTerm=<string>` requests.
 * @note This follows search.js Point 1 requirements.
 */
SearchRouter.get('/', async (req, res) => {
    try {
        // Unpack query arguments from URL.
        const { searchTerm } = req.query;

        // Do API search call.
        const searchResult = await api.searchByName(searchTerm);

        // Build possible history entry.
        const formattedResults = _formatMeals(searchResult.meals);
        const resultCount = formattedResults.length;
        const resultDate = new Date();
        const resultDateStr = `${resultDate.toDateString()} ${resultDate.toLocaleTimeString('en-US')}`;

        // Looks for the searchTerm in search_history collection in MongoDB.
        const historyCursor = await mongo.find('search_history', searchTerm);
        const historyItemsExist = await historyCursor.next();

        // Create the entry object that contains searchTerm information.
        const tempEntry = {
            searchTerm: searchTerm,
            searchCount: resultCount,
            lastSearched: resultDateStr
        };
        
        // Check whether to store / update the search result in history.
        if (!historyItemsExist === null) {
            await mongo.create('search_history', tempEntry);
        } else {
            await mongo.update('search_history', historyItemExist.searchTerm, tempEntry);
        }

        /// @note Send response at last step to avoid double header settings on exception handling path of execution.
        res.json(formattedResults);

    } catch (err) {
        res.status(500).json({errorMsg: `${err}`});
    }
});

/**
 * @description Handles `GET /search/:id/details?cache=<true|false>` requests.
 * @note Follows search.js Part 2 requirements.
 */
SearchRouter.get('/:id/details', async (req, res) => {
    try {
        // Unpack query arguments from URL.
        const { id } = req.params;
        const { cacheQueryParam } = req.query;

        // Storage for result of API or cache
        let resultObject = null;

        // Based on query flag, fetch detailed data from search_cache if needed.
        if (cacheQueryParam === "true") {
            const cacheCursor = mongo.find('search_cache', {mealId: id});

            if (cacheCursor.hasNext()) {
                // load entry from cache
                resultObject = cacheCursor.next();
            } else {
                const newSearchResult = await api.searchById(id);
                await mongo.create('search_cache', newSearchResult);

                // otherwise load fresh entry from API on cache miss
                resultObject = newSearchResult;
            }
        } else {
            const newSearchResult = await api.searchById(id);
            await mongo.create('search_cache', newSearchResult);
            resultObject = newSearchResult;
        }

        res.json(resultObject);

    } catch (err) {
        res.status(500).json({errorMsg: `${err}`});
    }
});

export default SearchRouter;
