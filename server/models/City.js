const mongoose = require('mongoose');



const citySchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
}, {timestamps: true});

const City = mongoose.model('City', citySchema);

module.exports = City;
