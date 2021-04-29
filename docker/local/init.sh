#!/bin/sh

pm2 start node_modules/@dhteam/pg-swagger-kit/src/server.js --watch
npm install
npm run migrate
sls offline start
