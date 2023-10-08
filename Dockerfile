# BUILD STAGE
FROM node:18-alpine as build

WORKDIR /app

# Fetch dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy application source
COPY . ./

# Build application
RUN yarn build

# RUN STAGE
FROM node:18-alpine as run

WORKDIR /app

# Default ENV arguments for bot-framework level things
ENV LOG_LEVEL=INFO

ENV DISCORD_ERROR_LOGGING_ENABLED=false
ENV DISCORD_GENERAL_LOGGING_ENABLED=false

ENV DISCORD_REGISTER_COMMANDS=true
ENV DISCORD_REGISTER_COMMANDS_AS_GLOBAL=true

# Copy build source
COPY --from=build /app/built ./built

# Fetch runtime dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Start application
CMD yarn start