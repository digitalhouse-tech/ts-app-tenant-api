#!/bin/sh

cd swagger
npm install
pm2 start server.js --watch

cd ..
npm install
npm run migrate
sls offline start

