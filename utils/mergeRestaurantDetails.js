// utils/mergeRestaurantDetails.js
const mergeRestaurantDetails = (dbRestaurant, googleDetails, yelpDetails) => {
    return {
        id: dbRestaurant.id,
        name: dbRestaurant.name || googleDetails.name || yelpDetails.name || 'Not Available',
        address: googleDetails.address || dbRestaurant.address || 'Not Available',
        latitude: googleDetails.latitude || yelpDetails.coordinates?.latitude || dbRestaurant.latitude || 'Not Available',
        longitude: googleDetails.longitude || yelpDetails.coordinates?.longitude || dbRestaurant.longitude || 'Not Available',
        open_now: googleDetails.open_now !== undefined
            ? (googleDetails.open_now ? 'Yes' : 'No')
            : (dbRestaurant.open_now || 'No'),
        opening_hours: googleDetails.opening_hours.length > 0
            ? googleDetails.opening_hours
            : dbRestaurant.opening_hours || ['Unknown'],
        rating: yelpDetails.rating || dbRestaurant.rating || 'Not Available',
        cuisine_type: yelpDetails.categories && yelpDetails.categories.length > 0
            ? yelpDetails.categories.map(category => category.title).join(', ')
            : 'Not specified',
        menu_url: yelpDetails.menu_url || googleDetails.website || dbRestaurant.menu_url || 'Not available',
        phone: yelpDetails.phone || dbRestaurant.phone || 'Not Available',
        image_url: yelpDetails.image_url || dbRestaurant.image_url || 'Not Available',
        website: yelpDetails.url || googleDetails.website || 'Not Available',
        // Add any other necessary fields here
    };
};

module.exports = { mergeRestaurantDetails };
