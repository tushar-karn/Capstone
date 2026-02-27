# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Vite project
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (Cloud Run expects 8080 by default, but we'll map it)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
