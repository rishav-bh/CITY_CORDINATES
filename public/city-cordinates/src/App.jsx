import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setCity(event.target.value);
  };

  const getCoordinates = async (e) => {
    e.preventDefault();
    setError('');
    setCoordinates({ lat: '', lon: '' });

    if (city.trim() === '') {
      setError('Please enter a valid city name');
      return;
    }

    try {
      // Sending a POST request to your API
      const response = await fetch('http://localhost:7000/api/getCityCoordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: city }),
      });

      const data = await response.json();

      if (response.ok) {
        setCoordinates({ lat: data.latitude, lon: data.longitude });
      } else {
        setError('Could not fetch data for the provided city');
      }
    } catch (error) {
      setError('An error occurred while fetching data');
    }
  };

  return (
    <div className="App">
      <h1>City Coordinates Finder</h1>
      <form onSubmit={getCoordinates}>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder="Enter city name"
        />
        <button type="submit">Get Coordinates</button>
      </form>

      {error && <p className="error">{error}</p>}

      {coordinates.lat && coordinates.lon && (
        <div>
          <h2>Coordinates for {city}:</h2>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lon}</p>
        </div>
      )}
    </div>
  );
}

export default App;
