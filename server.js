require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const City = require("./models/City"); // Your City model
const cors = require("cors");
const path = require("path");
const moment = require("moment");
const now = moment();

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Wrapper API route
app.post("/api/getCityCoordinates", async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).send("City name is required");
  }

  try {
    // Fetch coordinates from OpenWeatherMap API
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.WEATHER_API_KEY}`
    );

    if (response.data && response.data.length > 0) {
      const cityData = response.data[0];
      const { lat, lon } = cityData;

      // Save city and coordinates to MongoDB
      const city = new City({
        cityName,
        latitude: lat,
        longitude: lon,
        formattedDate: now.format("DD-MM-YYYY HH-mm-ss")
      });

      await city.save();

      // Send response back to the frontend
      return res.status(200).json({
        cityName,
        latitude: lat,
        longitude: lon,
        formattedDate: now.format("DD-MM-YYYY HH-mm-ss"),
        message: "City data fetched and saved successfully"
      });
    } else {
      return res.status(404).json({ message: "City not found" });
    }
  } catch (error) {
    console.error("Error fetching city data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// console.log("Platform:", os.platform());
// console.log("Total Memory:", os.totalmem());
// console.log("Info of CPU:", os.cpus());
// console.log("Free Memory:", os.freemem());

// console.log("Current date and time:", now.format());
// // formatted date
// const formattedDate = now.format("DD-MM-YYYY HH-mm-ss")
// console.log("Formatted date:", formattedDate);
// // parsed date
// const dateString = "13-09-2024";
// const parsedDate = moment(dateString, 'DD-MM-YYYY');
// console.log('Parsed date:', parsedDate.format('MMMM D, YYYY'));

// console.log(now.format('dddd, MMMM Do YYYY, hh-mm-ss a'));
