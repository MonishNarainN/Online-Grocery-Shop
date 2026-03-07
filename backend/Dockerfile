# Use Python 3.11-slim as the foundation
FROM python:3.11-slim

# Install Node.js 22 and build tools
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the backend package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install Python dependencies globally
# Since we are in an isolated container, we can install directly
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose the main port
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]
