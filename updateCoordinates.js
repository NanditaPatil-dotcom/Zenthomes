const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const geocodeLocation = require("./utils/geocodeMaptiler.js");

async function updateOldListings() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); // Change if needed

  const listings = await Listing.find({ geometry: { $exists: false } });

  for (let listing of listings) {
    try {
      const geoData = await geocodeLocation(listing.location);
      if (!geoData) {
        console.log(`❌ Couldn't geocode ${listing.title}`);
        continue;
      }

      listing.geometry = geoData;
      await listing.save();
      console.log(`Updated ${listing.title} with coords:`, geoData.coordinates);
    } catch (err) {
      console.error(`Error updating ${listing.title}`, err);
    }
  }

  mongoose.connection.close();
}

updateOldListings();
