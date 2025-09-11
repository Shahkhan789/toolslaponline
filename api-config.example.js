// API Configuration Template
// Copy this file to 'api-config.js' and add your API keys for local development
// Never commit api-config.js to version control

const API_CONFIG = {
    GROQ_API_KEY: 'your-groq-api-key-here',
    YOUTUBE_API_KEY: 'your-youtube-api-key-here'
};

// Function to get API key securely
function getApiKey(service) {
    switch(service) {
        case 'groq':
            return API_CONFIG.GROQ_API_KEY !== 'your-groq-api-key-here' ? API_CONFIG.GROQ_API_KEY : null;
        case 'youtube':
            return API_CONFIG.YOUTUBE_API_KEY !== 'your-youtube-api-key-here' ? API_CONFIG.YOUTUBE_API_KEY : null;
        default:
            return null;
    }
}

// Make function globally available
if (typeof window !== 'undefined') {
    window.getApiKey = getApiKey;
}
