# Use a Node.js base image
FROM node:21-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 5001

# Run the backend
CMD ["nodemon", "server.js"]
