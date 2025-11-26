# Movies on Demand - NZBGet Container
# Uses linuxserver/nzbget as base with Node.js wrapper for job orchestration

FROM linuxserver/nzbget:latest

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm install --production

# Copy the wrapper script
COPY src/ ./src/

# Expose port for health checks (optional)
EXPOSE 8080

# The entrypoint runs our Node.js wrapper which:
# 1. Starts NZBGet in daemon mode
# 2. Configures Usenet server via JSON-RPC
# 3. Adds the NZB download
# 4. Monitors progress and reports to Worker
# 5. Uploads completed file to R2
ENTRYPOINT ["node", "src/index.js"]
