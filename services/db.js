/**
 * @file db.js
 * @instructor Prof. Auman
 * @course CS 4220 Spring 2024
 * @author "Derek's Group"
 * @note Borrowed from the deck-of-cards sample.
 */

import dotenv from 'dotenv';
import {MongoClient} from 'mongodb';

/**
 * @description Contains the ES6-style module for interacting with a remote MongoDB instance.
 * @returns {{connect: () => Promise<void>, close: () => Promise<void>, create: () => Promise<void>, find: () => Promise<any>, update: () => Promise<void>}} - The unpacked object with MongoDB utility functions.
 */
const mongo = () => {
    // 1. Load and unpack the environment variables from the .env file
    dotenv.config();

    const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
    const mongoURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

    /** @type {MongoClient} */
    let client;

    /** @type {Db} */
    let db;

    /**
     * @description Attempts to open a connection to the MongoDB database.
     * @returns {Promise<void>}
     */
    async function connect() {
        try {
            client = new MongoClient(mongoURL);
            await client.connect();

            db = client.db();
  
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error( err );
        }
    }

    /**
     * Closes the connection to the MongoDB database
     * @description Attempts to open a connection to the MongoDB database.
     * @returns {Promise<void>}
     */
    async function close() {
        try {
            await client.close();

            console.log('Closed connection to MongoDB');
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Creates a new document in the specified collection
     * @param {string} collectionName - name of the collection
     * @param {Object} data - data to be inserted into the collection
     * @returns {Promise<void>}
     */
    async function create(collectionName, data) {
        try {
            const collection = db.collection(collectionName);
            await collection.insertOne(data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Finds documents in the specified collection
     * @param {string} collectionName - name of the collection
     * @param {string} keyword - identifier for filtering documents
     * @returns {Promise<FindCursor<WithId<Document>>>} - a MongoDB Cursor object as Promise result.
     */
    async function find(collectionName, keyword) {
        try {
            const collection = db.collection(collectionName);

            if (keyword) {
                const cursor = collection.find({
                    searchTerm: keyword
                });
                return cursor;
            } else {
                const cursor = collection.find({});
                return cursor;
            }
        }
        catch(err){
            console.error( err );
        }
    }

    /**
     * Updates documents in the specified collection
     * @param {string} collectionName - name of the collection
     * @param {string} deckIdentifier - identifier for filtering documents
     * @param {Object} data - the data to be updated
     * @returns {Promise<void>}
     */
    async function update(collectionName, keyword, data) {
        try {
            const collection = db.collection(collectionName);
            await collection.updateOne(
                { searchTerm: keyword },
                { $set: data }
            );
        } catch (err) {
            console.error(err);
        }
    }
    
    return {
        connect,
        close,
        create,
        find,
        update
    };
};

export default mongo();