# Movies on Demand - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

A personal ephemeral movie streaming service that lets you search the global movie catalog, fetch movies on-demand from Usenet, and stream them temporarily. Movies are automatically deleted if not watched for 1 week. This is not a permanent media library—it's an on-demand acquisition and streaming system.

## Key Features

### Movie Search

Users can search for movies by title using The Movie Database (TMDB), allowing them to quickly find specific films. The search provides instant results as they type, showing movie posters, titles, release dates, ratings, and plot summaries.

### Browse Popular Movies

Users can browse a curated list of currently popular movies from TMDB, helping them discover what's trending and what others are watching. This provides a quick way to find new content to watch.

### Browse Top Movies

Users can view the top-rated movies of all time from TMDB, sorted by rating and popularity. This helps discover critically acclaimed films and classics.

### Movie Recommendations

Users can discover similar movies based on films they're viewing, helping them find new content that matches their interests. When viewing a movie's details, similar movies are displayed with posters and ratings.

### On-Demand Movie Acquisition

Users can request any movie from the global catalog. When you select a movie to watch, the system automatically:

-   Finds available Usenet releases for that movie
-   Downloads the movie from Usenet
-   Prepares it for streaming
-   Makes it available for playback

All of this happens on-demand—no pre-existing library or permanent storage.

### Release Selection

When requesting a movie, users can either:

-   **Automatic Selection**: The system automatically picks the best available release based on quality preferences (e.g., 1080p preferred over 720p)
-   **Manual Selection**: View a list of available releases with different qualities (720p, 1080p, 4K), file sizes, and encodings, then choose the one you want

### Status Tracking

Users can see real-time status updates for movies being fetched:

-   **Queued**: Movie request is in the queue
-   **Starting**: Container is starting up
-   **Downloading**: Movie is being downloaded from Usenet
-   **Ready**: Movie is available for streaming
-   **Error**: Something went wrong (with error details)

### Streaming Playback

Once a movie is ready, users can stream it directly in the browser with a full-featured video player including play/pause, seek, volume control, and fullscreen support. Movies stream from cloud storage as if they were part of your own streaming service.

### Automatic Cleanup

Movies are automatically deleted if they have not been watched for 1 week. This keeps storage usage low and ensures the system remains ephemeral—no permanent library to maintain. The system tracks when you last watched each movie and removes files that haven't been accessed in 7 days.

## User Workflows

### Search and Select a Movie

**Goal**: Find a movie and request it for viewing

**Steps**:

1. Navigate to the movies on demand page
2. Enter a movie title in the search box or browse popular/top movies
3. View search results with posters, titles, and ratings
4. Click on a movie to view its details
5. Review movie information (plot, cast, runtime, etc.)
6. Click "Fetch & Watch" or "Watch" button

**Result**: Movie acquisition process begins

### Browse Popular Movies

**Goal**: Discover popular movies to watch

**Steps**:

1. Navigate to the movies on demand page
2. Click on "Popular Movies" section or tab
3. Browse through the list of popular movies with posters and ratings
4. Click on any movie to view its details
5. Click "Fetch & Watch" to request the movie

**Result**: Access to a curated list of popular movies with detailed information

### Browse Top Movies

**Goal**: See the top-rated movies of all time

**Steps**:

1. Navigate to the movies on demand page
2. Click on "Top Movies" section or tab
3. Browse through the list of top-rated movies
4. Click on any movie to view its details
5. Click "Fetch & Watch" to request the movie

**Result**: Access to top-rated movies with detailed information

### Discover Similar Movies

**Goal**: Find movies similar to one you're viewing

**Steps**:

1. Navigate to a movie's details page
2. Scroll to the "Similar Movies" section
3. Browse the list of recommended similar films with posters and ratings
4. Click on any similar movie to view its details
5. Click "Fetch & Watch" to request a similar movie

**Result**: Discovery of new movies that match your viewing preferences

### Choose a Release (Manual Mode)

**Goal**: Select a specific quality or release for a movie

**Steps**:

1. After clicking "Watch" on a movie, if manual selection is enabled
2. View a list of available Usenet releases showing:
    -   Quality (720p, 1080p, 4K)
    -   File size
    -   Encoding details
    -   Release group
3. Select the release you prefer
4. Confirm selection

**Result**: System begins downloading the selected release

### Monitor Download Progress

**Goal**: Track the status of a movie being fetched

**Steps**:

1. After requesting a movie, the details page shows status
2. Watch status updates in real-time:
    -   "Queued" - waiting to start
    -   "Starting" - container starting up
    -   "Downloading" - fetching from Usenet (with progress percentage)
    -   "Ready" - available for streaming
3. Status updates automatically refresh

**Result**: Clear visibility into when the movie will be ready

### Watch a Movie

**Goal**: Stream and watch a movie in the browser

**Steps**:

1. Navigate to a movie's details page
2. Wait for status to show "Ready" (or if already ready, proceed immediately)
3. Click "Play" button
4. Movie streams in the video player
5. Use video controls to play, pause, seek, adjust volume, or enter fullscreen
6. Watch the movie

**Result**: Movie plays in the browser with full video player controls

### View Movie History

**Goal**: See history of movies you've requested

**Steps**:

1. Navigate to the movies on demand page
2. View "Recently Watched" or "History" section
3. See list of movies you've fetched and watched
4. Note: Movie files are already deleted, but metadata remains for reference

**Result**: Access to viewing history without permanent storage

## User Capabilities

-   Search for movies by title with instant results from TMDB
-   Browse popular movies and top movies of all time
-   View detailed movie information including:
    -   Posters and backdrop images
    -   Plot summaries and overviews
    -   Cast and crew details
    -   Ratings and reviews
    -   Genre classifications
    -   Production information
-   Request any movie from the global catalog for on-demand acquisition
-   Choose between automatic or manual release selection
-   Monitor real-time download and preparation status
-   Stream movies directly in the browser
-   Use full-featured video player controls (play, pause, seek, volume, fullscreen)
-   View recently watched movies (metadata only, files are deleted)
-   Discover similar movies based on current selection

## Use Cases

### On-Demand Movie Watching

Search for any movie, request it, and watch it within minutes. No need to maintain a permanent library—movies are fetched on-demand and automatically deleted if not watched for 1 week.

### Quality Selection

Choose specific releases based on quality preferences. Want 4K for a new release? Select it. Prefer smaller file sizes? Pick a compressed 1080p version.

### Ephemeral Viewing

Watch movies without building a permanent collection. Perfect for one-time viewing or trying out new films without committing to long-term storage.

### Discovery and Exploration

Browse the entire movie catalog via TMDB, discover new films through popular lists, top-rated movies, and similar movie recommendations, and watch them immediately without needing subscriptions to multiple streaming services.

### Browsing Popular Content

Stay current with what's popular by browsing the popular movies list, which updates regularly based on current trends and viewing patterns.

### Finding Classics

Discover critically acclaimed films and all-time favorites by browsing the top movies list, sorted by ratings and popularity.

## User Benefits

-   **Global Catalog Access**: Search and access any movie in TMDB's database
-   **Popular Content Discovery**: Browse currently popular movies to stay current with trends
-   **Top Movies Access**: Discover critically acclaimed films and all-time favorites
-   **Smart Recommendations**: Find similar movies based on what you're viewing
-   **On-Demand Acquisition**: Movies are fetched only when you want them
-   **No Permanent Storage**: Automatic cleanup after 1 week of inactivity keeps storage costs low
-   **Quality Control**: Choose specific releases based on your preferences
-   **Real-Time Status**: See exactly when your movie will be ready
-   **Simple Interface**: One unified UI for search, browsing, status, and playback
-   **Cost Effective**: Only pay for what you use, no always-on servers
-   **Self-Cleaning**: No library maintenance required—movies delete automatically after 1 week of not being watched

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.yml`, `FRONTEND.md`, and `BACKEND.md`.
