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

# Install Python dependencies for the chatbot
# Note: requirements.txt is now in chatbot/ folder
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir -r chatbot/requirements.txt

# Set environment variables for Python
ENV PATH="/app/venv/bin:$PATH"

# Expose the main port (Render uses PORT env var, usually 10000)
# We don't expose 5001 because it's only used internally
EXPOSE 10000

# Start the application
# Node will spawn the Python process internally
CMD ["node", "index.js"]
