const { point, lineString } = require('@turf/helpers')
const pointToLineDistance = require('@turf/point-to-line-distance')
const { BOROUGH_BOUNDS } = require('./geoJSON')

//checking to see if a point is near the borough line
const boroughsMap = (lat, lng, maxDistance = 0.1) => {
    const pointObj = point([lng, lat])  //create point

    let isNear = false
    let message = "Point is outside the allowed boroughs"

    for(const feature of BOROUGH_BOUNDS.features) {
       if (feature.geometry.type === "LineString") {
        const line = lineString(feature.geometry.coordinates)
        const distanceToLine = pointToLineDistance(pointObj, line, { units: 'kilometers'})

        if(distanceToLine <= maxDistance ) {
           isNear = true
           message = "Point is near the borough"
           break; 
        }
       } 
    }
    return { valid: isNear, message }
}

module.exports = { boroughsMap }
