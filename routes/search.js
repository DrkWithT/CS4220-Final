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
        // lower case the search term in case of same words, and name it as searchWord in case of duplicate name in entry
        const searchWord = req.query.searchTerm.toLowerCase();
        
        // Do API search call.
        const searchResult = await api.searchByName(searchWord);

        // Build possible history entry.
        const formattedResults = _formatMeals(searchResult.meals);
        const resultCount = formattedResults.length;
        const resultDate = new Date();
        const resultDateStr = `${resultDate.toDateString()} ${resultDate.toLocaleTimeString('en-US')}`;

        // Looks for the searchTerm in search_history collection in MongoDB.
        const historyCursor = await mongo.find('search_history', 'searchTerm', searchWord);
        const historyItemsExist = await historyCursor.next();

        // Create the entry object that contains searchTerm information.
        const tempEntry = {
            searchTerm: searchWord,
            searchCount: resultCount,
            lastSearched: resultDateStr
        };
        // Check whether to store / update the search result in history.
        if (historyItemsExist === null) {
            await mongo.create('search_history', tempEntry);
        } else {
            await mongo.update('search_history', searchWord, tempEntry);
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
        const { cache } = req.query;

        // Storage for result of API or cache
        let resultObject = null;

        const cacheCursor = await mongo.find('search_cache', 'mealid', id);
        const cacheItemExist = await cacheCursor.next();

        // Based on query flag, fetch detailed data from search_cache if needed.
        if (cache === 'true') {
            if (cacheItemExist === null) {
                const newSearchResult = await api.searchById(id);

                // Create the entry object that contains searchTerm information.
                const tempEntry = {
                    mealid: id,
                    meal: newSearchResult
                };

                await mongo.create('search_cache', tempEntry);
                // otherwise load fresh entry from API on cache miss
                resultObject = newSearchResult;
            } else {
                // load meal from cache entry
                resultObject = cacheItemExist.meal;
            }
        } else {
            const cacheCursor = await mongo.find('search_cache', 'mealid', id);
            const cacheItemExist = await cacheCursor.next();
            const newSearchResult = await api.searchById(id);

            // save the entry if don't have it in database
            if (cacheItemExist === null) {
                // Create the entry object that contains searchTerm information.
                const tempEntry = {
                    mealid: id,
                    meal: newSearchResult
                };
                await mongo.create('search_cache', tempEntry);
            }
            
            resultObject = newSearchResult;
        }

        res.json(resultObject);

    } catch (err) {
        res.status(500).json({errorMsg: `${err}`});
    }
});

export default SearchRouter;
