# =====================================================================
# Build Stage: Compile the React application
# =====================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy all source files (including .env file for build-time config)
COPY . .

# Build the application (Vite bakes env variables here)
RUN npm run build

# =====================================================================
# Production Stage: Serve static assets using Nginx
# =====================================================================
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing support
COPY containerisasi/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy env.sh script and make it executable
COPY containerisasi/env.sh /env.sh
RUN chmod +x /env.sh

EXPOSE 80

# Run env.sh first to generate env.js, then start nginx
CMD ["/bin/sh", "-c", "/env.sh && nginx -g 'daemon off;'"]
