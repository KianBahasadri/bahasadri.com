#!/bin/bash
# Run movies-on-demand Docker container locally

set -e

# Get script directory and ensure we're in the right place
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Verify we're in the container directory
if [ ! -f "Dockerfile" ] || [ ! -f "package.json" ]; then
    echo "Error: Must be run from backend/containers/movies-on-demand directory"
    echo "Current directory: $SCRIPT_DIR"
    exit 1
fi

# Load environment variables from .env file
ENV_FILE="$HOME/bahasadri.com/.env"

if [ -f "$ENV_FILE" ]; then
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a  # stop automatically exporting
    echo "Loaded environment variables from $ENV_FILE"
else
    echo "Warning: .env file not found at $ENV_FILE"
fi

# Build the Docker image
echo "Building Docker image in $SCRIPT_DIR..."
docker build -t movies-on-demand:local .

# Set required environment variables for testing
# export JOB_ID="test-job-$(date +%s)"
JOB_ID="job_1764305798581_onvyogbo"
export MOVIE_ID="514754"
export NZB_URL="https://api.nzbgeek.info/api?t=get&id=595e59e37a84e95a1e695f0d26e30089&apikey=${NZBGEEK_API_KEY}"
export RELEASE_TITLE="$RELEASE_TITLE"

echo "Starting container with:"
echo "  JOB_ID: $JOB_ID"
echo "  MOVIE_ID: $MOVIE_ID"
echo "  NZB_URL: $NZB_URL"
echo ""

# Run the container with host network
docker run --rm \
    --network host \
    -e JOB_ID="$JOB_ID" \
    -e MOVIE_ID="$MOVIE_ID" \
    -e NZB_URL="$NZB_URL" \
    -e RELEASE_TITLE="$RELEASE_TITLE" \
    -e CF_ACCESS_CLIENT_ID="${CONTAINER_SERVICE_TOKEN_ID}" \
    -e CF_ACCESS_CLIENT_SECRET="${CONTAINER_SERVICE_TOKEN_SECRET}" \
    -e USENET_USERNAME="$USENET_USERNAME" \
    -e USENET_PASSWORD="$USENET_PASSWORD" \
    -e USENET_SERVER1_HOST="$USENET_SERVER1_HOST" \
    -e USENET_SERVER1_PORT="$USENET_SERVER1_PORT" \
    -e USENET_SERVER1_CONNECTIONS="$USENET_SERVER1_CONNECTIONS" \
    -e USENET_SERVER1_ENCRYPTION="$USENET_SERVER1_ENCRYPTION" \
    -e USENET_SERVER2_HOST="$USENET_SERVER2_HOST" \
    -e USENET_SERVER2_PORT="$USENET_SERVER2_PORT" \
    -e USENET_SERVER2_CONNECTIONS="$USENET_SERVER2_CONNECTIONS" \
    -e USENET_SERVER2_ENCRYPTION="$USENET_SERVER2_ENCRYPTION" \
    -e USENET_SERVER3_HOST="$USENET_SERVER3_HOST" \
    -e USENET_SERVER3_PORT="$USENET_SERVER3_PORT" \
    -e USENET_SERVER3_CONNECTIONS="$USENET_SERVER3_CONNECTIONS" \
    -e USENET_SERVER3_ENCRYPTION="$USENET_SERVER3_ENCRYPTION" \
    -e R2_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
    -e R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
    -e R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
    -e R2_BUCKET_NAME="movies-on-demand" \
    movies-on-demand:local

