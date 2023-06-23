ARG NODE_VERSION

# Base system image with specific version of node and npm
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS node-npm
ARG NPM_VERSION
RUN apk --no-cache add curl
RUN npm config set audit=false fund=false loglevel=error omit=dev update-notifier=false
RUN npm i -g npm@${NPM_VERSION}

# Base application image with dependencies installed
FROM node-npm AS app-base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --prefer-offline --dev --ignore-scripts

# Build application dist
FROM app-base AS app-build
WORKDIR /usr/src/app
COPY --from=app-base /usr/src/app/node_modules/ ./node_modules
RUN true # See https://github.com/moby/moby/issues/37965
COPY package*.json ./
RUN true
COPY .env ./
RUN true
COPY src/ ./src
RUN true

# Application image with dist
FROM node-npm AS app
WORKDIR /usr/src/app
COPY --from=app-build /usr/src/app/package*.json ./
RUN true
COPY --from=app-build /usr/src/app/node_modules/ ./node_modules
RUN true
COPY --from=app-build /usr/src/app/.env/ ./
RUN true
COPY --from=app-build /usr/src/app/src/ ./src
EXPOSE 3000
CMD ["node", "src/server"]
