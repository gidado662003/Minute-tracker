PM2 setup for Minute-tracker

This repository contains a Next.js client in `client/` and an Express API in `server/`.

Quick PM2 commands (from repo root):

- Install dev deps: `npm install` (this will add pm2 to devDependencies)
- Start both apps with PM2: `npm run pm2:start`
- Restart: `npm run pm2:restart`
- Stop: `npm run pm2:stop`
- View logs: `npm run pm2:logs`

Notes:
- The `ecosystem.config.js` defines two apps: `meeting-api` (server/src/server.js) and `client` (runs `npm start` from `client/`).
- Ensure you build the client for production before starting: `npm --prefix client run build`
- Logs are stored in the `logs/` folder (create it if missing).
