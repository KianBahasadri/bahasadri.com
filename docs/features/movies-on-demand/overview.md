### 1. Purpose and High‑Level Goals

This system is a personal, one‑user “ephemeral streaming box” built on top of Cloudflare and Usenet. It is **not** a permanent media library; instead, it lets you:

- Search the global movie catalog (via TMDB).
- On demand, fetch a movie from Usenet.
- Stream it from cloud storage as if it were part of your own service.
- Automatically discard the file after you are done or after a short time.

The architecture is designed to:

- Scale to zero when unused (no always‑on servers to pay for).
- Keep storage usage low by deleting content after viewing.
- Push all heavy lifting into short‑lived, isolated jobs.
- Use Cloudflare’s ecosystem (Workers, Containers, R2) as the backbone.
- Use a Usenet provider + NZBGeek as the content acquisition side.

***

### 2. Components Overview

At a conceptual level, there are six main pieces:

1. **User Interface (bahasadri.com)**
   - A web app only you use.
   - Provides search, selection, status, and video playback.

2. **Metadata & Discovery (TMDB)**
   - Public movie database and search engine.
   - Powers “what exists in the world” and provides titles, posters, plots, etc.

3. **Usenet Indexer (NZBGeek)**
   - Search engine specifically for Usenet posts.
   - Translates “this movie from TMDB” into “these concrete Usenet releases” and ultimately into an NZB (the download manifest).

4. **Usenet Provider**
   - Commercial Usenet service that actually stores and serves the files.
   - The place your downloader connects to at high speed to pull article data.

5. **Cloudflare Backend**
   - **Workers**: lightweight request handlers and orchestrators.
   - **Containers**: full Linux containers that run heavy, short‑lived jobs such as Usenet downloading and file preparation.

6. **Cloud Storage (Cloudflare R2)**
   - Object storage used as a temporary buffer.
   - Stores movies just long enough for you to watch them.
   - Also stores any minimal metadata or status files you need for UX.

Additionally, there is a very small **job/state tracker** (for example, using a tiny database or key‑value store in Cloudflare) that remembers what is currently being fetched, what is ready, and what has been cleaned up.

***

### 3. User Experience Flow

From your perspective as the only user, the system works roughly like this:

1. **Search**
   - You open your bahasadri.com UI.
   - You type a movie name into a search bar.
   - The UI queries TMDB in real time and shows you rich search results: posters, titles, years, overviews.

2. **Select a Movie**
   - You click on the movie you want.
   - You see a detail view with TMDB data (title, year, description, maybe runtime and rating).
   - You press a “Watch” or “Fetch & Watch” button.

3. **(Optional) Choose a Release**
   - Depending on how you want it, the system either:
     - Automatically picks a suitable Usenet release behind the scenes, or
     - Shows you a short list of candidate releases from NZBGeek (with sizes and qualities: 720p, 1080p, 4K, etc.) so you can choose.
   - Once chosen (by you or automatically), the backend starts the acquisition process.

4. **Wait for Preparation**
   - The UI shows a status such as:
     - “Queued”
     - “Downloading”
     - “Preparing file”
     - “Ready to watch”
   - For many movies, this preparation window might be a few minutes or less, depending on file size and Usenet speed.

5. **Watch**
   - When the movie is ready, the UI offers a “Play” button.
   - You click play and the movie streams in your browser, as if it were hosted by your own streaming platform.

6. **Automatic Clean‑Up**
   - After you are done (or after a defined period, such as a day or a week), the underlying file in R2 is automatically deleted.
   - The UI may retain a simple history (e.g., “recently watched”), but the heavy data (the movie file itself) is gone.

***

### 4. Backend Acquisition Flow (From TMDB Selection to R2)

When you choose a movie to watch, a series of coordinated steps happen behind the scenes:

#### 4.1. Worker Receives the Request

- The UI sends a request to a Cloudflare Worker with the movie’s identifiers (e.g., TMDB ID, and if known, IMDb ID).
- The Worker:
  - Validates that the request is from you.
  - Records a new “job” in the small job/state tracker, with an initial status like “queued” for that movie/session.

#### 4.2. Find a Matching Usenet Release via NZBGeek

- The Worker uses the movie’s identifiers to call the NZBGeek API.
- It requests all Usenet posts that match that movie, ideally by IMDb ID or TMDB ID, which is more reliable than name matching alone.
- NZBGeek responds with a list of potential releases (different qualities, encodes, and sizes).

Then one of two patterns happens:

- **Automatic mode**:  
  The Worker chooses the “best” candidate according to simple preferences:
  - Desired quality (for example, 1080p over 720p).
  - Reasonable file size.
  - Recent, complete release.

- **Interactive mode**:  
  The Worker sends the candidate list back to the UI, where you pick one explicitly. Your selection is then sent back to the Worker to continue.

In both cases, the end result is a specific Usenet release, represented by an NZB URL or NZB metadata.

#### 4.3. Spinning Up a Container Job

- With a chosen NZB in hand, the Worker launches a new Cloudflare Container instance configured for this one job.
- The Worker passes the job details into the container:
  - Which Usenet provider to use (credentials and server info).
  - The chosen NZB reference.
  - Where in R2 the finished file should be uploaded.
  - A job identifier or session token to report status back.

The job is designed to be **self‑contained and short‑lived**: it exists only to acquire this one movie.

#### 4.4. Downloading from Usenet Inside the Container

Inside the container, a custom NZBGet instance runs in a fully isolated environment:

- It connects to your Usenet provider over an encrypted connection.
- It uses the NZB to download all the pieces of the movie at high speed.
- It uses associated parity/repair data (if available) to verify and fix any missing or corrupt chunks.
- It unpacks and reconstructs the final movie file (for example, turning a set of archive parts into a single video file).

All of this happens on the container's own ephemeral storage.

The small job/state tracker is updated periodically with progress information, so your UI can show “downloading” and approximate progress.

#### 4.5. Uploading to R2 and Finalizing

When the container has a complete, verified movie file:

- It uploads that file to R2 under a temporary namespace:
  - For example, something like a random or session‑specific path, possibly linked to the TMDB ID.
- Optionally, it can also write a minimal metadata record alongside it (size, resolution, basic title info) as a small sidecar object in R2, or report those details back through the Worker for storage in the job/state tracker.

Once the R2 upload finishes:

- The container updates the job’s status to “ready” and records the R2 location.
- The container cleans up its local temporary data.
- The container exits and is allowed to go idle, so billing for that job stops.

At this point, the movie exists only in R2 and is ready for streaming.

***

### 5. Streaming Flow (From “Ready” to Playback)

With the movie in R2 and marked as “ready”, the playback path is straightforward:

1. **UI Polling / Push**
   - Your UI either polls the Worker periodically for the job status, or the Worker pushes updates to the UI through a suitable channel.
   - When the job status changes to “ready”, the UI transforms into a “Play” screen.

2. **Retrieving a Streamable URL**

   When you hit “Play”, the UI sends a playback request to the Worker. The Worker:

   - Confirms that you are allowed to access this job and file.
   - Retrieves the R2 location and any needed metadata.
   - Generates a secure way for your browser to fetch the content:
     - This can be a signed URL, a proxied streaming endpoint, or an HLS playlist location, depending on how you choose to serve it.

3. **Direct Streaming from R2 via Cloudflare**

   - Your browser’s video player connects to the provided URL and starts streaming the movie.
   - The data flows from R2 through Cloudflare’s edge to your browser.
   - Neither the Worker nor the Container is involved in the hot path of streaming; they only orchestrate and authorize access.

From your point of view, you are simply watching a movie in your own custom app. Under the hood, R2 is acting as your ephemeral content server.

***

### 6. Lifecycle & Clean‑Up

Because your design specifically avoids building a permanent library, the lifecycle of each movie is short and well‑defined.

#### 6.1. Viewing Window

You can define a retention policy such as:

- Keep the movie for a fixed time after it becomes ready (for example, 24 hours or a few days).
- Alternatively, track last playback time and remove it after some period of inactivity.

During this window:

- The movie is fully streamable.
- The status in your UI is “ready” or “available”.
- If you refresh the page, the state is reconstructed from the small job/state tracker and the presence of the file in R2.

#### 6.2. Automatic Deletion

A scheduled process in Cloudflare (for example, a periodic Worker) scans for expired jobs:

- It checks which entries in the job/state tracker are older than your retention threshold or explicitly marked as “completed and discardable”.
- For each expired job:
  - Deletes the movie object from R2.
  - Deletes any associated metadata objects.
  - Clears or archives the job record so it no longer appears as available in the UI.

The result is:

- Storage usage in R2 stays low, because you only hold a handful of movies at a time.
- There is no “collection” to maintain; the system is inherently self‑cleaning.

***

### 7. Cost and Scalability Characteristics (Conceptual)

From a high‑level standpoint:

- **Compute (Containers):**
  - Only used when actively downloading and preparing content from Usenet.
  - Jobs are short‑lived and spin down automatically.
  - At your expected usage (dozens of movies per month), total container cost remains low.

- **Storage (R2):**
  - Used as a rolling buffer rather than as a permanent library.
  - Costs scale roughly with how many movies you keep at once and for how long.
  - Given aggressive deletion, monthly storage cost for movies remains small.

- **Network:**
  - Downloads from Usenet to containers count as incoming traffic, which is generally inexpensive.
  - Streaming from R2 to you over Cloudflare’s edge is designed to avoid traditional egress charges.

- **External Subscriptions:**
  - You have fixed, predictable costs for:
    - Your Usenet provider.
    - Your Usenet indexer (such as NZBGeek).
    - Your Cloudflare account.

Because you are the only user, there is essentially no multi‑tenant scaling concern: the system is built to handle far more traffic than you will generate. That excess capacity gives you snappy behavior and plenty of headroom.

***

### 8. Summary

The architecture you’ve converged on is:

- **Discovery‑driven**: TMDB for exploring the entire movie universe.
- **On‑demand acquisition**: NZBGeek + Usenet + short‑lived Cloudflare Containers for fetching just what you request, when you request it.
- **Ephemeral storage**: Cloudflare R2 used as a temporary buffer, not as a forever library.
- **Simple, custom UX**: bahasadri.com as the single, personalized control panel and player.

It minimizes always‑on infrastructure, reuses strong external services where they shine (TMDB for metadata, NZBGeek for search, Usenet for content distribution, Cloudflare for compute and storage), and keeps your own logic focused on orchestration and a clean user experience rather than low‑level mechanics.