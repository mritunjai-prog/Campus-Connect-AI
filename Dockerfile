FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite frontend and esbuild server
RUN npm run build

# Expose the default port (Northflank will pass PORT env var anyway)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
