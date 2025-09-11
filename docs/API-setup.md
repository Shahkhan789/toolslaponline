# Local API keys and secure setup

This repository supports loading local API keys from an optional `api-config.js` file. The file is not committed to the repository and should be created locally from the example.

## Steps

1. Copy the example file to a local file:

```bash
cp api-config.example.js api-config.js
```

2. Open `api-config.js` and replace the placeholder values with your real keys:

- `YOUTUBE_API_KEY` — YouTube Data API v3 key (safe for public client-side usage for many read-only operations).
- `GROQ_API_KEY` — Groq AI key (this is typically a private/paid key; do NOT expose it in client-side code in production).

3. Run or test the site locally. `index.html` will load `api-config.js` if present and scripts can access `window.TOOLSLAP_API_KEYS`.

## Security notes

- Never commit `api-config.js` or any real secrets to version control. This repo includes `.gitignore` to avoid accidental commits of `api-config.js`.
- For any private/paid keys (like Groq), prefer a server-side proxy or store the key in environment variables on your server. Calling such APIs directly from browser JS exposes the key to anyone who inspects network requests or page source.
- If a key is accidentally committed, rotate it immediately.