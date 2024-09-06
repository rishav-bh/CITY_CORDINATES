require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const City = require('./models/City');
const path = require('path');
const cors = require("cors"); // Import cors

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json()); // For parsing JSON request bodies
app.use(express.static(path.join(__dirname, 'public/index'))); // Serve static files from the 'public' directory
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Route to get city coordinates and save to database
app.post('/cities', async (req, res) => {
    const cityName = req.body.cityName;
    console.log("req.body", req.body);

  if (!cityName) {
    return res.status(400).send('City name is required');
  }

  try {
    // Fetch coordinates from external API
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${process.env.WEATHER_API_KEY}`, {
      params: {
        q: cityName,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric',
        country: 'IN'
      }
    });
      console.log('API Response:', response.data);
      console.log('Response Coordinates:', response.data);

    
     if (Array.isArray(response.data) && response.data.length > 0) {
      // Extract the first item from the array
      const cityData = response.data[0];
      const { lat, lon, country } = cityData;

      console.log("Latitude:", lat);
      console.log("Longitude:", lon);

    // Save city and coordinates to MongoDB
    const city = new City({
      cityName,
      latitude: lat,
      longitude: lon,
      countryName: country
    });

    await city.save();

    res.status(201).send({
      message: 'City data saved successfully',
      city
    });
  }else {
      console.error('No city data found in API response');
      res.status(404).send('City not found');
    }
  } catch (error) {
    console.error('Error fetching city data:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
