# Movies on Demand - NZBGet Container
# Debian-based container with NZBGet and Node.js

FROM node:lts-bookworm-slim

# Install NZBGet and required tools
# Note: unrar (non-free) is required for password-protected RAR archives.
# unrar-free does NOT support encrypted archives.
RUN echo "deb http://deb.debian.org/debian bookworm non-free" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y --no-install-recommends \
    nzbget \
    unrar \
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

# Run the Node.js wrapper which:
# 1. Initializes NZBGet config
# 2. Starts NZBGet in daemon mode
# 3. Configures Usenet server via JSON-RPC API
# 4. Adds the NZB download
# 5. Monitors progress and reports to Worker
# 6. Uploads completed file to R2
ENTRYPOINT ["node", "src/index.js"]
