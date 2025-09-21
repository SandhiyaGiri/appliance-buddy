# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY appliance-buddy/package*.json ./appliance-buddy/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd appliance-buddy && npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd appliance-buddy && npm run build

# Build backend
RUN cd backend && npm run build

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["npm", "start"]
