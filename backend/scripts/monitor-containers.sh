#!/bin/bash
# Monitor Movies on Demand containers and queue processing
# Usage: ./scripts/monitor-containers.sh [container-name]
#
# Note: Queue monitoring is best done via wrangler dev logs
# This script focuses on container monitoring

echo "🔍 Monitoring Movies on Demand Containers and Queue"
echo "=================================================="
echo ""

# Function to show running containers
show_containers() {
    echo "📦 Running Containers:"
    echo "---------------------"
    docker ps --filter "name=movies" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"
    echo ""
}

# Function to tail container logs
tail_container_logs() {
    local container_name=$1
    if docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        echo "📋 Logs for ${container_name}:"
        echo "---------------------"
        docker logs -f --tail 50 "${container_name}" 2>&1 &
        echo $! > "/tmp/monitor_${container_name}.pid"
    fi
}

# Function to monitor all movie containers
monitor_all_containers() {
    echo "🔄 Monitoring all movie containers (Ctrl+C to stop)..."
    echo ""
    
    while true; do
        clear
        echo "🔍 Movies on Demand Monitor - $(date '+%Y-%m-%d %H:%M:%S')"
        echo "=================================================="
        echo ""
        
        show_containers
        
        # Show recent logs from all movie containers
        echo "📋 Recent Logs (last 10 lines from each container):"
        echo "---------------------------------------------------"
        for container in $(docker ps --filter "name=movies" --format "{{.Names}}" 2>/dev/null); do
            echo ""
            echo "📦 ${container}:"
            docker logs --tail 10 "${container}" 2>/dev/null | sed 's/^/  /'
        done
        
        echo ""
        echo "Press Ctrl+C to stop monitoring..."
        sleep 5
    done
}

# Check if specific container name provided
if [ -n "$1" ]; then
    echo "📋 Tailing logs for container: $1"
    echo "Press Ctrl+C to stop..."
    echo ""
    docker logs -f "$1" 2>&1
else
    monitor_all_containers
fi

