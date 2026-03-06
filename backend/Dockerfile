# Use Node.js 22 as the base image
FROM node:22-slim

# Install Python 3 and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the backend package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend files
COPY . .

# Install Python dependencies globally
# We use --break-system-packages because we are in an isolated container
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Expose the main port
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]
