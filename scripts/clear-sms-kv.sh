#!/usr/bin/env bash
#
# Clear all SMS Commander data from KV using wrangler CLI.
#
# Deletes all messages, threads, and optionally contacts from the SMS_MESSAGES
# KV namespace. Use with caution - this is destructive and irreversible.
#
# Usage:
#   ./scripts/clear-sms-kv.sh              # Clear messages and threads only
#   ./scripts/clear-sms-kv.sh --all        # Clear everything including contacts

set -euo pipefail

KV_NAMESPACE_ID="e1c31d9857df45d49f00c03daa8b9602"
CLEAR_ALL=false

# Parse arguments
for arg in "$@"; do
    if [ "$arg" = "--all" ]; then
        CLEAR_ALL=true
    fi
done

echo "🧹 Clearing SMS Commander KV data..."
echo ""

# Function to delete keys by prefix
delete_by_prefix() {
    local prefix=$1
    local description=$2
    
    echo "Deleting $description..."
    
    # List all keys with prefix and delete them
    local deleted=0
    while true; do
        # Get keys in batches (limit to 100 at a time to avoid overwhelming the API)
        local keys
        keys=$(pnpm exec wrangler kv key list --namespace-id="$KV_NAMESPACE_ID" --prefix="$prefix" 2>/dev/null | jq -r '.[].name // empty' | head -100)
        
        if [ -z "$keys" ]; then
            break
        fi
        
        # Delete each key
        while IFS= read -r key; do
            if [ -n "$key" ]; then
                pnpm exec wrangler kv key delete --namespace-id="$KV_NAMESPACE_ID" "$key" >/dev/null 2>&1 && ((deleted++)) || true
            fi
        done <<< "$keys"
        
        # Small delay to avoid rate limiting
        sleep 0.5
    done
    
    echo "✓ Deleted $deleted $description"
    echo ""
}

# Clear per-counterpart messages
delete_by_prefix "messages:" "per-counterpart message records"

# Clear global message index
delete_by_prefix "global-message:" "global message index entries"

# Clear thread summaries
delete_by_prefix "thread:" "thread summaries"

if [ "$CLEAR_ALL" = true ]; then
    # Clear contacts
    delete_by_prefix "contacts:" "contact records"
    
    # Clear contact index
    delete_by_prefix "contacts-by-number:" "contact index entries"
    
    echo "🔥 Nuked everything from KV"
else
    echo "✅ Cleared messages and threads (contacts preserved)"
    echo "   Use --all flag to delete contacts too"
fi

