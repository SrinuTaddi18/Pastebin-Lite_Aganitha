# Code references (quick verify)

- **GET /api/healthz:** `backend/index.js` ~34–37, `backend/lib/db.js` healthCheck  
- **POST /api/pastes:** `backend/index.js` ~39–80, `backend/lib/paste.js` createPaste, getPasteUrl  
- **GET /api/pastes/:id:** `backend/index.js` ~83–91, `backend/lib/paste.js` fetchAndConsumeView  
- **GET /p/:id:** `backend/index.js` ~95–113, `backend/lib/paste.js` getPasteForView, escapeHtml  

