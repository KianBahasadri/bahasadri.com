-- Movies on Demand D1 Schema
-- Job tracking and watch history for ephemeral movie streaming

-- Jobs: tracks lifecycle of each fetch/download job
CREATE TABLE IF NOT EXISTS jobs (
    job_id TEXT PRIMARY KEY,
    movie_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    progress REAL,
    release_title TEXT,
    release_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    ready_at TEXT,
    expires_at TEXT,
    last_watched_at TEXT,
    error_message TEXT,
    r2_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_movie_id ON jobs(movie_id);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);

-- Watch history: persisted metadata about movies watched
CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    title TEXT,
    poster_path TEXT,
    last_watched_at TEXT NOT NULL,
    job_id TEXT,
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_watch_last_watched ON watch_history(last_watched_at DESC);

-- Optional: store a cached TMDB metadata row for faster reads
CREATE TABLE IF NOT EXISTS movie_metadata (
    movie_id INTEGER PRIMARY KEY,
    title TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    updated_at TEXT
);
