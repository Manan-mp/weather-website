const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Weather API endpoint (by city name)
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }
        
        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        const response = await fetchWeatherData(apiUrl, res);
    } catch (error) {
        console.error('Error fetching weather:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Weather API endpoint (by coordinates)
app.get('/api/weather-by-coords', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        
        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        const response = await fetchWeatherData(apiUrl, res);
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to fetch and format weather data
async function fetchWeatherData(apiUrl, res) {
    // Import fetch dynamically for Node.js compatibility
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (response.ok) {
        // Format the weather data
        const weatherData = {
            name: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
        
        res.json(weatherData);
    } else {
        res.status(404).json({ error: 'Location not found' });
    }
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🌤️  Weather app is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});