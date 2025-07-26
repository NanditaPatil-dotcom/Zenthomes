const { geocoding, config } = require('@maptiler/client');
require('dotenv').config();

config.apiKey = process.env.MAP_TOKEN;

async function geocodeLocation(location) {
  try {
    const response = await geocoding.forward(location, {
      limit: 1,
    });

    console.dir(response, { depth: null });

    if (!response || !response.features || response.features.length === 0) {
      console.log("No features found for location:", location);
      return null;
    }

 const coordinates = response.features[0].geometry.coordinates;

    return {
      type: 'Point',
      coordinates,
    };
  } catch (err) {
    console.error("Error while geocoding:", err);
    return null;
  }
}

module.exports = geocodeLocation;
