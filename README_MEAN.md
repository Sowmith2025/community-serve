# MEAN Conversion

## Structure
- backend: Node/Express API (Mongo-ready)
- frontend-angular: Angular app (replaces React)

## Run locally
1. Backend: `cd backend && npm i && npm run dev`
2. Angular: `cd frontend-angular && npm i && npm start`
   - The Angular dev server runs on 4200; API on 5000.

## Build for production
1. `cd frontend-angular && npm run build`
   - Output: `frontend-angular/dist/frontend-angular`
2. Set `NODE_ENV=production` and start backend: `cd backend && npm start`
   - Backend serves Angular build automatically if present.

## Environment
- Angular uses `src/environments/*` with `apiBaseUrl` defaulting to `http://localhost:5000`.
- You can override at runtime by setting `window.__APP_API__` in `index.html`.

## Notes
- Services mirror existing endpoints: auth, events, users, attendance, organizer.
- Token is stored in localStorage and attached via Axios interceptor.