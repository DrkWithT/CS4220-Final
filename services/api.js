/**
 * @file api.js
 * @instructor Prof. Auman
 * @course CS 4220 Spring 2024
 * @author "Derek's Group"
 */

// For interacting with the deck of cards api
import axios from 'axios';

// base is the prefix of the API url before expansion.
const base = `https://www.themealdb.com/api/json/v1/1`;

// www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
export async function searchByName(mealName) {
    try {
        const apiURL = `${base}/search.php?s=${mealName}`;
        const response = await axios.get(apiURL);

        return response.data;
    } catch (error) {
        console.error(error);
    }
}

/**
 * @description Does a search by API id for some recipe.
 * @note Sample URL: `www.themealdb.com/api/json/v1/1/lookup.php?i=52772`
 * @param {string} mealId Numeric literal as string.
 * @returns {any} The response data.
 */
export async function searchById(mealId) {
    try {
        const apiURL = `${base}/lookup.php?i=${mealId}`;
        const response = await axios.get(apiURL);

        return response.data;
    } catch (error) {
        console.error(error);
    }
}

// www.themealdb.com/api/json/v1/1/search.php?f=a
export async function searchByFirstLetter(mealFL) {
    try {
        const apiURL = `${base}/search.php?f=${mealFL}`;
        const response = await axios.get(apiURL);

        return response.data;
    } catch (error) {
        console.error(error);
    }
}