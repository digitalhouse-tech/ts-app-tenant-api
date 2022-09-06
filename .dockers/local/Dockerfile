FROM node:16.17.0-alpine

LABEL maintainer "Benjamin Berger <benjamin@digitalhouse.com>"

# Install project dependencies
RUN apk add --no-cache python3 py3-pip && \
    npm i -g pm2@latest serverless serverless-offline

WORKDIR /usr/src
