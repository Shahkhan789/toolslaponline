// api-config.example.js
// Example API config for local development.
// Copy this file to api-config.js locally and replace the placeholder values with your real keys.
// IMPORTANT: Do NOT commit api-config.js to the repository. Add it to .gitignore.

window.TOOLSLAP_API_KEYS = {
  // YouTube Data API v3 key (for client-side requests like public video metadata/transcripts)
  // Example format: "AIzaSy..."
  YOUTUBE_API_KEY: "AIzaSyCniV5A1dqVe3TJ07caG_VTwAJfsFOL5kU",

  // Groq AI key (server-side usage strongly recommended)
  // Example format: "gsk_..."
  // WARNING: Do not expose this key in browser JS for production. Use a server-side proxy.
  GROQ_API_KEY: "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"
};

// Backward compatibility with existing tools
window.API_CONFIG = {
  YOUTUBE_API_KEY: window.TOOLSLAP_API_KEYS.YOUTUBE_API_KEY,
  GROQ_API_KEY: window.TOOLSLAP_API_KEYS.GROQ_API_KEY
};

// Function to get API key securely (backward compatibility)
function getApiKey(service) {
  switch(service) {
    case 'groq':
      return window.TOOLSLAP_API_KEYS.GROQ_API_KEY !== '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' ? window.TOOLSLAP_API_KEYS.GROQ_API_KEY : null;
    case 'youtube':
      return window.TOOLSLAP_API_KEYS.YOUTUBE_API_KEY !== 'AIzaSyCniV5A1dqVe3TJ07caG_VTwAJfsFOL5kU' ? window.TOOLSLAP_API_KEYS.YOUTUBE_API_KEY : null;
    default:
      return null;
  }
}

// Make function globally available
window.getApiKey = getApiKey;
