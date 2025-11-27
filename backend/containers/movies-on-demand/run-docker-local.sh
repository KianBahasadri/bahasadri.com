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
JOB_ID="job_1764280129473_c9gr15cd"
export MOVIE_ID="${MOVIE_ID:-12345}"
export NZB_URL="${NZB_URL:-https://api.nzbgeek.info/api?t=get&id=2a84869886df2024c39b1f6b884ac5b6&apikey=${NZBGEEK_API_KEY}}"
export RELEASE_TITLE="${RELEASE_TITLE:-The.Last.Samurai.2003.480p.DVDR-PANAM}"

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
    -e USENET_HOST="${USENET_HOST}" \
    -e USENET_PORT="${USENET_PORT:-563}" \
    -e USENET_USERNAME="${USENET_USERNAME}" \
    -e USENET_PASSWORD="${USENET_PASSWORD}" \
    -e USENET_CONNECTIONS="${USENET_CONNECTIONS:-10}" \
    -e USENET_ENCRYPTION="${USENET_ENCRYPTION:-true}" \
    -e R2_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
    -e R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
    -e R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
    -e R2_BUCKET_NAME="movies-on-demand" \
    movies-on-demand:local

