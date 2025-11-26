/**
 * Minimal test script to verify health check server works
 */
import { createServer } from "http";

const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", test: true }));
});

const port = 8080;
server.listen(port, "0.0.0.0", () => {
    console.log(`Health check server listening on port ${port}`);
    console.log("Test server is ready!");
});

server.on("error", (error) => {
    console.error(`Server error: ${error.message}`);
    process.exit(1);
});

// Keep process alive
process.on("SIGTERM", () => {
    console.log("Shutting down...");
    server.close(() => {
        process.exit(0);
    });
});

