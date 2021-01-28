FROM node:12.20.0-alpine

LABEL maintainer "Enzo García <enzo@digitalhouse.com>"

RUN echo "**** install git, python, pip and curl ****" && \
    apk add --no-cache git python3 py3-pip curl && \
    echo "**** install serverless ****" && \
    npm i -g serverless
