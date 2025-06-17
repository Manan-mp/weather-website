// Get DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const weatherResult = document.getElementById('weatherResult');
const error = document.getElementById('error');

// Weather display elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');

// Event listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Function to get weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name!');
        return;
    }
    
    // Show loading, hide other elements
    showLoading('Loading weather data...');
    
    try {
        // Make API call to our backend
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (response.ok) {
            displayWeather(data);
        } else {
            showError();
        }
    } catch (err) {
        console.error('Error:', err);
        showError();
    }
}

// Function to display weather data
function displayWeather(data) {
    // Hide loading and error
    hideAllSections();
    
    // Update weather information
    cityName.textContent = `${data.name}, ${data.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    temp.textContent = Math.round(data.temperature);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    weatherIcon.alt = data.description;
    description.textContent = data.description;
    feelsLike.textContent = Math.round(data.feelsLike);
    humidity.textContent = data.humidity;
    windSpeed.textContent = data.windSpeed;
    pressure.textContent = data.pressure;
    
    // Show weather result
    weatherResult.classList.remove('hidden');
}

// Helper functions
function showLoading(message = 'Loading weather data...') {
    hideAllSections();
    loadingText.textContent = message;
    loading.classList.remove('hidden');
}

function showError() {
    hideAllSections();
    error.classList.remove('hidden');
}

function hideAllSections() {
    loading.classList.add('hidden');
    weatherResult.classList.add('hidden');
    error.classList.add('hidden');
}

// Get user's current location
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            // Success callback
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const response = await fetch(`/api/weather-by-coords?lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                        cityInput.value = data.name; // Update input with detected city
                        displayWeather(data);
                    } else {
                        // Fallback to London if geolocation weather fails
                        fallbackToDefaultCity();
                    }
                } catch (err) {
                    console.error('Error getting location weather:', err);
                    fallbackToDefaultCity();
                }
            },
            // Error callback
            (error) => {
                console.log('Geolocation error:', error);
                fallbackToDefaultCity();
            },
            // Options
            {
                timeout: 10000, // 10 seconds timeout
                enableHighAccuracy: false
            }
        );
    } else {
        // Geolocation not supported
        console.log('Geolocation is not supported by this browser');
        fallbackToDefaultCity();
    }
}

// Fallback function to load default city
function fallbackToDefaultCity() {
    cityInput.value = 'London';
    getWeather();
}

// Load weather on page load
window.addEventListener('load', () => {
    getCurrentLocationWeather();
});