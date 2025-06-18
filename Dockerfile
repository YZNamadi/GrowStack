# Use Node.js 20 LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Update npm to latest version and install all dependencies (including dev dependencies for build)
RUN npm install -g npm@latest && \
    npm ci && \
    npm cache clean --force

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 