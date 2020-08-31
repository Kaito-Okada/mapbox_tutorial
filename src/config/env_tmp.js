const mapboxAccessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const demoAPI = 'YOUR_API_SERVER_URL';

const THRESHOLD2048 = {
    "0": "rgba(42, 0, 255, 0.5)",
    "64": "rgba(0, 102, 255, 0.5)",
    "128": "rgba(0, 240, 255, 0.5)",
    "256": "rgba(114, 255, 0, 0.5)",
    "512": "rgba(255, 222, 0, 0.5)",
    "1024": "rgba(255, 131, 20, 0.5)",
    "2048": "rgba(255, 0, 66, 0.5)"
};

module.exports = { 
    mapboxAccessToken,
    demoAPI,
    THRESHOLD2048
};