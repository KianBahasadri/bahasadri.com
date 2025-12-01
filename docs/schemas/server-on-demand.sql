-- Server on Demand D1 Schema
-- VPS server lifecycle tracking and metadata storage

-- Servers: tracks lifecycle of each provisioned VPS server
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    size_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    cost_so_far REAL NOT NULL DEFAULT 0,
    remaining_budget REAL NOT NULL,
    hourly_rate REAL NOT NULL,
    shortcuts TEXT,  -- JSON array of TerminalShortcut objects
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_expires_at ON servers(expires_at);
CREATE INDEX IF NOT EXISTS idx_servers_provider ON servers(provider_id);
CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at DESC);

-- Note: SSH private keys are stored in KV with key format: `ssh-key:{serverId}`
-- Note: Terminal sessions are managed by Durable Objects (one per server)
--       Durable Object ID format: `terminal:{serverId}`

