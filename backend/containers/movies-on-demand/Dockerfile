# Movies on Demand - NZBGet Container
# Debian-based container with NZBGet and Node.js

FROM node:20-slim

# Install NZBGet, and required tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    nzbget \
    unrar-free \
    p7zip-full \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create download directories
RUN mkdir -p /downloads/completed /downloads/intermediate /downloads/nzb /downloads/queue /downloads/tmp

# Create NZBGet config directory
RUN mkdir -p /config/nzbget

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm install --production

# Copy the wrapper script
COPY src/ ./src/

# Expose port for Cloudflare Container health checks
EXPOSE 8080

# Run the Node.js wrapper which:
# 1. Initializes NZBGet config
# 2. Starts NZBGet in daemon mode
# 3. Configures Usenet server via JSON-RPC API
# 4. Adds the NZB download
# 5. Monitors progress and reports to Worker
# 6. Uploads completed file to R2
ENTRYPOINT ["node", "src/index.js"]
