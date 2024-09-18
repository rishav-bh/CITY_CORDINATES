require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const City = require("./models/City"); // Assuming you have a Mongoose City model
const cors = require("cors");
const path = require("path");
const moment = require("moment");
const os = require("os");

const app = express();
const port = process.env.PORT || 7000;
const now = moment();

// Middleware setup
app.use(express.json());
// Enable CORS for all routes
const _dirname = path.dirname("")
const _distpath = path.join(_dirname, "../public/city-cordinates/dist")
app.use(express.static(_distpath))
app.use(cors({
  origin: "http://0.0.0.0/0"
}
)); 

// Check for required environment variables
if (!process.env.MONGODB_URI || !process.env.WEATHER_API_KEY) {
  console.error("Missing required environment variables. Exiting...");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// API route to get city coordinates
app.post("/api/getCityCoordinates", async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ message: "City name is required" });
  }

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.WEATHER_API_KEY}`
    );

    if (response.data && response.data.length > 0) {
      const cityData = response.data[0];
      const { lat, lon } = cityData;

      // Save city data in MongoDB
      const city = new City({
        cityName,
        latitude: lat,
        longitude: lon,
        formattedDate: now.format("DD-MM-YYYY HH-mm-ss"),
      });

      await city.save();

      return res.status(200).json({
        cityName,
        latitude: lat,
        longitude: lon,
        formattedDate: now.format("DD-MM-YYYY HH-mm-ss"),
        message: "City data fetched and saved successfully",
      });
    } else {
      return res.status(404).json({ message: "City not found" });
    }
  } catch (error) {
    console.error("Error fetching city data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
