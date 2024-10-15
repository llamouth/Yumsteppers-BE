// queries/yelp.js
const axios = require('axios');
const { YELP_API_KEY } = process.env;

const getYelpBusinessDetails = async (name, latitude, longitude) => {
    try {
        const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: {
                Authorization: `Bearer ${YELP_API_KEY}`,
            },
            params: {
                term: name,
                latitude,
                longitude,
                limit: 1,
            },
        });

        if (response.data.businesses && response.data.businesses.length > 0) {
            const business = response.data.businesses[0];
            return {
                id: business.id,
                name: business.name,
                url: business.url,
                categories: business.categories, 
                rating: business.rating,
                menu_url: business.menu_url || null, 
            };
        } else {
            return { error: 'No Yelp business found.' };
        }
    } catch (error) {
        console.error('Error fetching Yelp business details:', error.response?.data || error.message);
        return { error: error.response?.data || 'Failed to fetch Yelp business details.' };
    }
};

module.exports = { getYelpBusinessDetails };
