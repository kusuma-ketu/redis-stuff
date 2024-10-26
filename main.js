const express = require('express');
const redis = require('redis');
const axios = require('axios');
require('dotenv').configure();

const app = express();
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
})

const API_KEY = process.env.API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

app.get('/weather', async(req,res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({error: 'City required'});
    }
})

redisClient.get(city, async(err, weatherData) => {
    if (err) {
        return res.status(500).json({error: 'Redis error'});
    }
    if (weatherData) {
        return res.json({source: 'cache', data: JSON.parse(weatherData)});
    }
})

try {
    const response = await axios.get(BASE_URL, {
        params: {
            q: city,
            appid: API_KEY,
            units: 'metric' // Change to 'imperial' for Fahrenheit
        }
    });

    // Store the fetched data in Redis
    redisClient.setex(city, 3600, JSON.stringify(response.data)); // Cache for 1 hour
    res.json({ source: 'api', data: response.data });
} catch (error) {
    return res.status(404).json({ error: 'City not found' });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});