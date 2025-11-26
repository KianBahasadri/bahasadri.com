#!/bin/bash
# Test script for movies-on-demand container
# This script sets up environment variables and runs the container script locally

set -e

# Test URL provided by user
TEST_NZB_URL="https://api.nzbgeek.info/api?t=get&id=2a84869886df2024c39b1f6b884ac5b6&apikey=PcLQPgNjnXsmuckE1274ZZbJFTajABy8"

# Load environment variables from .env file
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs)
fi

# Set required environment variables for testing
export JOB_ID="test-job-$(date +%s)"
export MOVIE_ID="12345"
export NZB_URL="$TEST_NZB_URL"
export RELEASE_TITLE="The.Last.Samurai.2003.480p.DVDR-PANAM"

# Callback URL (for local testing, use a dummy URL or localhost)
export CALLBACK_URL="http://localhost:8787/api/movies-on-demand/internal/progress"
export CF_ACCESS_CLIENT_ID="${CONTAINER_SERVICE_TOKEN_ID}"
export CF_ACCESS_CLIENT_SECRET="${CONTAINER_SERVICE_TOKEN_SECRET}"

# Usenet server credentials
export USENET_HOST="${USENET_HOST}"
export USENET_PORT="${USENET_PORT:-563}"
export USENET_USERNAME="${USENET_USERNAME}"
export USENET_PASSWORD="${USENET_PASSWORD}"
export USENET_CONNECTIONS="${USENET_CONNECTIONS:-10}"
export USENET_ENCRYPTION="${USENET_ENCRYPTION:-true}"

# R2 credentials
export R2_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
export R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export R2_BUCKET_NAME="movies-on-demand"

echo "Starting container test with:"
echo "  JOB_ID: $JOB_ID"
echo "  NZB_URL: $NZB_URL"
echo "  USENET_HOST: $USENET_HOST"
echo ""

# Run the container script
cd "$(dirname "$0")"
node src/index.js

