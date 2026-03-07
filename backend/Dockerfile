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
RUN npm install --omit=dev

# Install Python dependencies globally
# Pre-installing common libraries to save time
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# --- Pre-download SentenceTransformer model ---
# This saves memory and time during the first container start
RUN python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy the rest of the backend files
COPY . .

# Expose the main port
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
