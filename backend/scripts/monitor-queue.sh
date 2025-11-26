#!/bin/bash
# Monitor Queue Processing
# This script helps you monitor queue activity during local development
# Best used alongside wrangler dev in a separate terminal

echo "📊 Queue Monitoring Guide"
echo "========================"
echo ""
echo "Queue monitoring is primarily done through wrangler dev logs."
echo ""
echo "In your wrangler dev terminal, look for:"
echo ""
echo "  ✅ Queue Processing:"
echo "     [wrangler:info] QUEUE movies-on-demand-jobs X/Y (duration)"
echo ""
echo "  ✅ Job Processing:"
echo "     Processing job: job_xxx for movie: 278"
echo ""
echo "  ✅ Container Startup:"
echo "     Container started for job: job_xxx"
echo ""
echo "  ❌ Errors:"
echo "     Failed to start container for job xxx: {error}"
echo ""
echo "To monitor in real-time:"
echo "  1. Run 'pnpm dev' in backend directory"
echo "  2. Watch the output for queue processing logs"
echo "  3. Use this script in another terminal to monitor containers"
echo ""
echo "Queue Configuration:"
echo "  - Queue: movies-on-demand-jobs"
echo "  - DLQ: movies-on-demand-dlq"
echo "  - Max retries: 2"
echo "  - Batch size: 1"
echo ""
echo "Checking queue status..."
echo ""

# Check if we're in the backend directory and can run wrangler
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$SCRIPT_DIR/package.json" ] && [ -d "$SCRIPT_DIR/node_modules/.bin" ]; then
    echo "📋 Listing queues (requires authentication):"
    cd "$SCRIPT_DIR" && pnpm wrangler queues list 2>/dev/null || echo "  (Run 'pnpm wrangler queues list' manually to see queues)"
else
    echo "⚠️  Not in backend directory or dependencies not installed."
    echo "   Run from backend directory: cd backend && pnpm install"
fi

echo ""
echo "💡 Tip: Queue processing logs appear in wrangler dev output."
echo "   Use grep to filter: wrangler dev 2>&1 | grep -i 'queue\|job\|container'"

