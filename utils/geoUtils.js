const { point, lineString } = require('@turf/helpers');
const { pointToLineDistance } = require('@turf/point-to-line-distance');
const { BOROUGH_BOUNDS } = require('./geoJSON');

// Checking to see if a point is near the borough line
const boroughsMap = (lat, lng, maxDistance = 20) => {
  if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid coordinates provided to boroughsMap:", { lat, lng });
      return { valid: false, message: "Invalid coordinates" };
  }

  const pointObj = point([lng, lat]); // Create point

  let isNear = false;
  let message = "Point is outside the allowed boroughs";

  for (const feature of BOROUGH_BOUNDS.features) {
      if (feature.geometry.type === "LineString") {
          const line = lineString(feature.geometry.coordinates);
          try {
              const distanceToLine = pointToLineDistance(pointObj, line, { units: 'kilometers' });
              console.log(`Distance to line for point (${lat}, ${lng}):`, distanceToLine);

              if (distanceToLine <= maxDistance) {
                  isNear = true;
                  message = "Point is near the borough";
                  break;
              }
          } catch (error) {
              console.error("Error calculating distance:", error);
          }
      }
  }

  console.log(`Result for point (${lat}, ${lng}):`, { isNear, message });
  return { valid: isNear, message };
};


 
module.exports = { boroughsMap };
