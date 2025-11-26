# Monitoring Queue and Containers During Local Development

## Queue Monitoring

### During `wrangler dev`

The `wrangler dev` output shows queue processing in real-time:

-   Queue consumer invocations: `[wrangler:info] QUEUE movies-on-demand-jobs X/Y (duration)`
-   Queue handler logs: All `console.log()` statements from `handleMovieQueue()`
-   Queue errors: Any errors during message processing

**What to look for:**

```
[wrangler:info] QUEUE movies-on-demand-jobs 1/1 (1581ms)
Processing job: job_xxx for movie: 278
Container started for job: job_xxx
```

### List Queues (Production)

```bash
# List all queues in your account
cd backend
pnpm wrangler queues list
```

### Queue Status via Logs

The queue consumer logs show:

-   **Message processing**: `Processing job: {job_id} for movie: {movie_id}`
-   **Container startup**: `Container started for job: {job_id}`
-   **Errors**: `Failed to start container for job {job_id}: {error}`
-   **Batch info**: `QUEUE movies-on-demand-jobs X/Y (duration)` shows batch size and processing time

### Dead Letter Queue (DLQ)

If messages fail after max retries, they go to the DLQ:

-   Queue name: `movies-on-demand-dlq`
-   Check DLQ in Cloudflare Dashboard: Workers & Pages → Queues → movies-on-demand-dlq

### Filter Queue Logs

```bash
# In wrangler dev output, look for:
# - "QUEUE" - queue processing
# - "Processing job" - job start
# - "Container started" - successful container start
# - "Failed to start" - errors
```

## Quick Commands

### Monitor All Containers

```bash
# In backend directory
./scripts/monitor-containers.sh
```

### Monitor Specific Container

```bash
# Find container name first
docker ps --filter "name=movies"

# Then tail its logs
docker logs -f <container-name>
```

### Monitor Wrangler Dev Logs

The `wrangler dev` output already shows:

-   Queue processing logs (from `handleMovieQueue`)
-   Container start/stop events
-   Worker console.log statements

### Watch Docker Containers

```bash
# List all running movie containers
docker ps --filter "name=movies"

# Watch container status
watch -n 2 'docker ps --filter "name=movies" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

### Tail Container Logs in Real-Time

```bash
# Tail logs from all movie containers
docker ps --filter "name=movies" --format "{{.Names}}" | xargs -I {} sh -c 'echo "=== {} ===" && docker logs -f --tail 20 {}'
```

## What to Look For

### Queue Processing

-   Look for: `Processing job: job_xxx for movie: xxx`
-   Look for: `Container started for job: xxx`
-   Look for: `Failed to start container for job xxx`

### Container Logs

-   Health check server: `Health check server listening on port 8080`
-   NZBGet startup: `NZBGet is ready`
-   Download progress: `Downloading: X/Y MB`
-   Upload progress: `Upload progress: X%`
-   Errors: Any error messages

### Container Status

-   Check if containers are running: `docker ps`
-   Check if containers exited: `docker ps -a`
-   Check exit codes: `docker ps -a --format "{{.Names}}\t{{.Status}}"`

## Tips

1. **Run in separate terminals:**

    - Terminal 1: `wrangler dev` (shows queue processing)
    - Terminal 2: `./scripts/monitor-containers.sh` (shows container logs)

2. **Filter logs:**

    ```bash
    docker logs <container> 2>&1 | grep -i "error\|ready\|progress"
    ```

3. **Check container resource usage:**

    ```bash
    docker stats --filter "name=movies"
    ```

4. **View all container logs at once:**
    ```bash
    docker ps --filter "name=movies" --format "{{.Names}}" | while read name; do
      echo "=== $name ==="
      docker logs --tail 20 "$name"
    done
    ```
