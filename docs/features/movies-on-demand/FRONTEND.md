# Movies on Demand - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Movies on Demand utility. Provides a user interface for searching and discovering movies from TMDB, fetching movies on-demand from Usenet, tracking acquisition progress, and streaming them. Supports both automatic and manual release selection for on-demand acquisition.

## Code Location

`frontend/src/pages/movies-on-demand/`

## API Contract Reference

See `docs/features/movies-on-demand/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/movies-on-demand`

**Component**: `MoviesOnDemand.tsx`

**Description**: Main page for movies on demand utility with search, popular, and top movies browsing

**Route Configuration**:

```typescript
<Route path="/movies-on-demand" element={<MoviesOnDemand />} />
```

### `/movies-on-demand/movies/:id`

**Component**: `MovieDetails.tsx`

**Description**: Movie details page showing comprehensive information about a specific movie, similar movies, available releases, and fetch options

**Route Configuration**:

```typescript
<Route path="/movies-on-demand/movies/:id" element={<MovieDetails />} />
```

### `/movies-on-demand/movies/:id/watch`

**Component**: `MoviePlayer.tsx`

**Description**: Movie player page for streaming and watching movies. Takes TMDB movie ID as parameter.

**Route Configuration**:

```typescript
<Route path="/movies-on-demand/movies/:id/watch" element={<MoviePlayer />} />
```

**Note**: The route uses the TMDB movie ID. If navigating from a job context, first retrieve the `movie_id` from the job status, then navigate to this route with the movie ID.

## Components

### MoviesOnDemand (Main Page)

**Location**: `MoviesOnDemand.tsx`

**Purpose**: Main page component that provides movie search, browsing popular and top movies, and navigation to movie details

**State**:

-   Server state: TanStack Query for movie search, popular movies, top movies
-   Local state: Search query input, active tab (search/popular/top), current page

**Layout**:

-   Search bar at the top
-   Tabs or sections for Search, Popular, Top Movies, and History
-   Movie grid/list displaying movie cards
-   Pagination controls
-   Recently Watched section (shows watch history)

### MovieCard

**Location**: `components/MovieCard/MovieCard.tsx`

**Purpose**: Displays a movie poster, title, release date, and rating in a card format

**Props**:

```typescript
interface MovieCardProps {
    movie: Movie;
    onClick?: () => void;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Click to navigate to movie details page

**Styling**:

-   CSS Modules: `MovieCard.module.css`
-   Hover effects for interactivity
-   Responsive grid layout

### MovieDetails (Details Page)

**Location**: `MovieDetails.tsx`

**Purpose**: Displays comprehensive movie information, available Usenet releases, and controls for fetching/watching the movie

**State**:

-   Server state: TanStack Query for movie details, available releases, similar movies, and job status
-   Local state: Fetch mode (auto/manual), selected release, job tracking

**Layout**:

-   Hero section with backdrop image and movie poster
-   Movie title, release date, runtime, genres
-   Overview/plot summary
-   Cast section with actor photos and character names
-   Crew section with key personnel
-   Available releases section (shows quality, file size, codec details)
-   Release selection modal (for manual mode)
-   Fetch/Watch button and job status display
-   Similar movies section at bottom

**Interactions**:

-   Click on similar movie to navigate to its details page
-   Click "Fetch & Watch" to start on-demand movie acquisition
-   Choose automatic or manual release selection mode
-   View real-time job status (queued, downloading, preparing, ready)
-   Click "Watch" when status is ready to navigate to player
-   View download progress percentage during acquisition

**Styling**:

-   CSS Modules: `MovieDetails.module.css`
-   Responsive layout with hero section
-   Grid layout for cast and similar movies
-   Release selection modal with quality/size information

### MoviePlayer (Watch Page)

**Location**: `MoviePlayer.tsx`

**Purpose**: Full-featured video player for streaming movies that are ready. Takes TMDB movie ID as route parameter.

**State**:

-   Server state: TanStack Query for stream URL (by movie ID)
-   Local state: Video player state (playing, volume, current time, etc.)

**Route Parameter Handling**:

-   Route parameter `:id` is the TMDB movie ID (integer)
-   Component extracts movie ID from route params
-   Calls stream API: `GET /api/movies-on-demand/movies/{movieId}/stream`
-   The API endpoint accepts the movie ID and internally resolves to the correct job/stream URL

**Layout**:

-   Full-screen or embedded video player
-   Video controls overlay (play/pause, seek bar, volume, fullscreen)
-   Movie information header (optional)
-   Loading state while fetching stream URL

**Interactions**:

-   Play/pause video
-   Seek to different positions
-   Adjust volume
-   Toggle fullscreen
-   Navigate back to movie details

**Styling**:

-   CSS Modules: `MoviePlayer.module.css`
-   Full-screen video player layout
-   Custom video controls overlay

### MovieSearch

**Location**: `components/MovieSearch/MovieSearch.tsx`

**Purpose**: Search input component with debounced search functionality

**Props**:

```typescript
interface MovieSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}
```

**State**:

-   Local state: Search input value

**Interactions**:

-   User types in search box
-   Debounced search triggers after user stops typing
-   Search results update automatically

**Styling**:

-   CSS Modules: `MovieSearch.module.css`

### MovieList

**Location**: `components/MovieList/MovieList.tsx`

**Purpose**: Displays a grid or list of movie cards with pagination

**Props**:

```typescript
interface MovieListProps {
    movies: Movie[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onMovieClick: (movieId: number) => void;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Click on movie card to navigate to details
-   Click pagination controls to change page

**Styling**:

-   CSS Modules: `MovieList.module.css`
-   Responsive grid layout
-   Loading skeleton states

### ReleaseSelector

**Location**: `components/ReleaseSelector/ReleaseSelector.tsx`

**Purpose**: Modal or dropdown component for selecting a Usenet release for manual mode movie fetching

**Props**:

```typescript
interface ReleaseSelectorProps {
    releases: UsenetRelease[];
    isLoading: boolean;
    onSelect: (release: UsenetRelease) => void;
    onCancel: () => void;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   View available releases with quality, size, codec info
-   Click to select a release
-   Cancel selection

**Styling**:

-   CSS Modules: `ReleaseSelector.module.css`
-   Modal or inline list
-   Quality/size badges

### JobStatusDisplay

**Location**: `components/JobStatusDisplay/JobStatusDisplay.tsx`

**Purpose**: Displays real-time job status and progress for movie acquisition

**Props**:

```typescript
interface JobStatusDisplayProps {
    job: JobStatus | null;
    isLoading: boolean;
    onWatchClick?: () => void;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Display status: queued, downloading, preparing, ready, error
-   Show progress percentage during download
-   Show error message if status is error
-   Enable watch button when status is ready

**Styling**:

-   CSS Modules: `JobStatusDisplay.module.css`
-   Progress bar animation
-   Status badge colors
-   Error message styling

### WatchHistoryList

**Location**: `components/WatchHistoryList/WatchHistoryList.tsx`

**Purpose**: Displays a list of movies that have been watched, sorted by most recently watched

**Props**:

```typescript
interface WatchHistoryListProps {
    movies: WatchHistoryItem[];
    isLoading: boolean;
    onMovieClick: (movieId: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Click on movie card to navigate to movie details
-   Scroll to load more (infinite scroll) or click "Load More" button
-   Display "deleted" badge for movies that have been cleaned up

**Styling**:

-   CSS Modules: `WatchHistoryList.module.css`
-   Grid or list layout similar to MovieList
-   "Deleted" badge for movies no longer available
-   Last watched timestamp display

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    search: (query: string, page: number) =>
        ["movies-on-demand", "search", query, page] as const,
    popular: (page: number) => ["movies-on-demand", "popular", page] as const,
    top: (page: number) => ["movies-on-demand", "top", page] as const,
    details: (id: number) => ["movies-on-demand", "details", id] as const,
    releases: (id: number) => ["movies-on-demand", "releases", id] as const,
    similar: (id: number, page: number) =>
        ["movies-on-demand", "similar", id, page] as const,
    jobStatus: (jobId: string) => ["movies-on-demand", "job", jobId] as const,
    activeJobs: () => ["movies-on-demand", "jobs"] as const,
    stream: (movieId: number) => ["movies-on-demand", "stream", movieId] as const,
    history: (limit: number, offset: number) =>
        ["movies-on-demand", "history", limit, offset] as const,
};

// TanStack Query hooks
const useMovieSearch = (query: string, page: number) => {
    return useQuery({
        queryKey: queryKeys.search(query, page),
        queryFn: () => searchMovies(query, page),
        enabled: query.length > 0,
    });
};

const usePopularMovies = (page: number) => {
    return useQuery({
        queryKey: queryKeys.popular(page),
        queryFn: () => getPopularMovies(page),
    });
};

const useTopMovies = (page: number) => {
    return useQuery({
        queryKey: queryKeys.top(page),
        queryFn: () => getTopMovies(page),
    });
};

const useMovieDetails = (id: number) => {
    return useQuery({
        queryKey: queryKeys.details(id),
        queryFn: () => getMovieDetails(id),
    });
};

const useMovieReleases = (id: number) => {
    return useQuery({
        queryKey: queryKeys.releases(id),
        queryFn: () => getMovieReleases(id),
    });
};

const useSimilarMovies = (id: number, page: number) => {
    return useQuery({
        queryKey: queryKeys.similar(id, page),
        queryFn: () => getSimilarMovies(id, page),
    });
};

const useJobStatus = (jobId: string) => {
    return useQuery({
        queryKey: queryKeys.jobStatus(jobId),
        queryFn: () => getJobStatus(jobId),
        // Poll for updates while job is active
        refetchInterval: (data) => {
            if (data?.status === "ready" || data?.status === "error") {
                return false;
            }
            return 2000; // Poll every 2 seconds while downloading/preparing
        },
    });
};

const useActiveJobs = () => {
    return useQuery({
        queryKey: queryKeys.activeJobs(),
        queryFn: () => listActiveJobs(),
        refetchInterval: 2000, // Poll for active jobs
    });
};

const useMovieStream = (movieId: number) => {
    return useQuery({
        queryKey: queryKeys.stream(movieId),
        queryFn: () => getMovieStream(movieId),
        enabled: !!movieId,
    });
};

const useWatchHistory = (limit: number = 20, offset: number = 0) => {
    return useQuery({
        queryKey: queryKeys.history(limit, offset),
        queryFn: () => getWatchHistory(limit, offset),
    });
};

const useFetchMovie = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { movieId: number; request: FetchMovieRequest }) =>
            fetchMovie(data.movieId, data.request),
        onSuccess: (data) => {
            // Invalidate movie details to refresh job status
            queryClient.invalidateQueries({
                queryKey: queryKeys.details(data.job_id.split("_")[1]),
            });
        },
    });
};
```

### Local State (React)

```typescript
// Search query input
const [searchQuery, setSearchQuery] = useState<string>("");

// Active tab/view
const [activeView, setActiveView] = useState<
    "search" | "popular" | "top" | "history"
>("popular");

// Current page for pagination
const [currentPage, setCurrentPage] = useState<number>(1);

// Fetch mode (auto or manual release selection)
const [fetchMode, setFetchMode] = useState<"auto" | "manual">("auto");

// Selected release for manual mode
const [selectedRelease, setSelectedRelease] = useState<UsenetRelease | null>(
    null
);

// Quality preference for auto mode
const [qualityPreference, setQualityPreference] = useState<string>("1080p");

// Video player state
const [isPlaying, setIsPlaying] = useState<boolean>(false);
const [currentTime, setCurrentTime] = useState<number>(0);
const [volume, setVolume] = useState<number>(1);
const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

// Watch history pagination
const [historyLimit, setHistoryLimit] = useState<number>(20);
const [historyOffset, setHistoryOffset] = useState<number>(0);
```

## API Integration

### TMDB Image URL Helper

**Location**: `lib/tmdb.ts`

TMDB returns partial image paths (e.g., `/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`). This helper constructs full URLs with the correct base URL and size.

```typescript
// lib/tmdb.ts

export const getImageUrl = (
    path: string | null,
    size: "w500" | "original" = "w500"
): string => {
    if (!path) return "/placeholder-poster.png";

    return `https://image.tmdb.org/t/p/${size}${path}`;
};
```

**Usage**:

-   `w500`: Standard poster size (500px width) - use for movie cards and lists
-   `original`: Full resolution - use for hero sections and backdrops
-   Returns placeholder path if image path is null

**Examples**:

```typescript
// Poster for movie card
const posterUrl = getImageUrl(movie.poster_path, "w500");

// Backdrop for hero section
const backdropUrl = getImageUrl(movie.backdrop_path, "original");

// Profile image for cast
const profileUrl = getImageUrl(castMember.profile_path, "w500");
```

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Search movies
export const searchMovies = async (
    query: string,
    page: number = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/search?query=${encodeURIComponent(
            query
        )}&page=${page}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search movies");
    }

    return response.json();
};

// Get popular movies
export const getPopularMovies = async (
    page: number = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(`/api/movies-on-demand/popular?page=${page}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get popular movies");
    }

    return response.json();
};

// Get top movies
export const getTopMovies = async (
    page: number = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(`/api/movies-on-demand/top?page=${page}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get top movies");
    }

    return response.json();
};

// Get movie details
export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
    const response = await fetch(`/api/movies-on-demand/movies/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get movie details");
    }

    return response.json();
};

// Get available Usenet releases for a movie
export const getMovieReleases = async (
    id: number
): Promise<ReleasesResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/movies/${id}/releases`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get movie releases");
    }

    return response.json();
};

// Get similar movies
export const getSimilarMovies = async (
    id: number,
    page: number = 1
): Promise<SimilarMoviesResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/movies/${id}/similar?page=${page}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get similar movies");
    }

    return response.json();
};

// Fetch a movie from Usenet (auto or manual release selection)
export const fetchMovie = async (
    id: number,
    request: FetchMovieRequest
): Promise<FetchMovieResponse> => {
    const response = await fetch(`/api/movies-on-demand/movies/${id}/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch movie");
    }

    return response.json();
};

// Get job status
export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(`/api/movies-on-demand/jobs/${jobId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get job status");
    }

    return response.json();
};

// List active jobs
export const listActiveJobs = async (): Promise<{ jobs: JobStatus[] }> => {
    const response = await fetch(`/api/movies-on-demand/jobs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to list jobs");
    }

    return response.json();
};

// Get movie stream URL
// Note: id parameter should be the TMDB movie ID (number as string)
// The API internally resolves the movie ID to the correct job/stream URL
export const getMovieStream = async (movieId: number): Promise<StreamResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/movies/${movieId}/stream`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get movie stream");
    }

    return response.json();
};

// Get watch history
export const getWatchHistory = async (
    limit: number = 20,
    offset: number = 0
): Promise<WatchHistoryResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/history?limit=${limit}&offset=${offset}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get watch history");
    }

    return response.json();
};
```

### Error Handling

-   Display error messages in UI when API calls fail
-   Show fallback UI for network errors
-   Handle empty search results gracefully
-   Display loading states during API calls

## User Interactions

### Primary Actions

-   **Search Movies**:

    -   Trigger: User types in search box
    -   Flow: Debounced search → API call → Display results
    -   Error handling: Show error message if search fails

-   **View Movie Details**:

    -   Trigger: Click on movie card
    -   Flow: Navigate to details page → Load movie details, releases, and similar movies
    -   Error handling: Show error message if movie not found

-   **Browse Popular/Top Movies**:

    -   Trigger: Click on Popular or Top Movies tab
    -   Flow: Load appropriate movie list → Display results with pagination
    -   Error handling: Show error message if API call fails

-   **View Watch History**:

    -   Trigger: Click on History tab
    -   Flow: Load watch history → Display movies sorted by most recently watched
    -   Error handling: Show error message if history fetch fails
    -   Display: Show movies with last watched timestamp, indicate if movie is deleted

-   **Pagination**:

    -   Trigger: Click on page number or next/previous buttons
    -   Flow: Update page state → Reload movie list for new page
    -   Error handling: Handle pagination errors gracefully

-   **Fetch Movie (Auto Mode)**:

    -   Trigger: Click "Fetch & Watch" with auto mode selected
    -   Flow: Submit fetch request → Get job ID → Start polling job status
    -   Error handling: Show error if fetch fails or no releases available

-   **Fetch Movie (Manual Mode)**:

    -   Trigger: Click "Fetch & Watch" with manual mode, select release from list
    -   Flow: Display available releases → User selects → Submit fetch request → Start polling job status
    -   Error handling: Show error if no releases found, unable to fetch

-   **Monitor Job Status**:

    -   Trigger: Automatic polling after fetch initiated
    -   Flow: Get job status → Update UI with status, progress percentage → Stop polling when ready/error
    -   Display: Show real-time status (queued, downloading, preparing, ready, error)

-   **Watch Movie**:
    -   Trigger: Click "Watch" button when job status is ready
    -   Flow: Extract movie ID from job → Navigate to `/movies-on-demand/movies/{movieId}/watch` → Fetch stream URL → Load video player → Start playback
    -   Error handling: Show error if stream URL unavailable
    -   Note: Always use movie ID for navigation, not job ID

### Form Handling

-   Search input with debouncing (300-500ms delay)
-   No form submission needed - search happens automatically
-   Release selection with preview of quality/size information
-   Video player controls with state management

## UI/UX Requirements

### Layout

-   Responsive grid layout for movie cards
-   Search bar prominently displayed at the top
-   Tab navigation for Search/Popular/Top Movies/History views
-   Movie details page with hero section and content sections
-   Release selector modal or inline list
-   Job status indicator with progress bar
-   Watch history list with last watched timestamps

### Visual Design

-   Movie posters displayed prominently in cards
-   Rating badges visible on movie cards
-   Backdrop images for movie details hero section
-   Clean, modern card-based design
-   Hover effects on interactive elements
-   Release quality/size badges (720p, 1080p, 4K)
-   Status indicators with color coding (queued=gray, downloading=blue, preparing=orange, ready=green, error=red)
-   Progress bar for download status

### User Feedback

-   Loading states: Skeleton loaders for movie cards during API calls
-   Error messages: Clear error messages displayed when API calls fail
-   Success feedback: Smooth transitions when content loads
-   Empty states: Friendly messages when no search results found
-   Pagination: Clear indication of current page and total pages
-   Job status updates: Real-time status display with progress percentage
-   Job error display: Clear error messages from job failures

## Implementation Checklist

### Components

-   [ ] MoviesOnDemand page component
-   [ ] MovieDetails page component
-   [ ] MoviePlayer page component
-   [ ] MovieCard component
-   [ ] MovieSearch component
-   [ ] MovieList component
-   [ ] ReleaseSelector component
-   [ ] JobStatusDisplay component
-   [ ] WatchHistoryList component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration
-   [ ] Movie details page route configuration
-   [ ] Movie player page route configuration (movie ID only)

### State Management

-   [ ] TanStack Query setup for all endpoints
-   [ ] API client functions for movie search, popular, top, details, releases, similar
-   [ ] API client functions for fetch movie, job status, list jobs, stream
-   [ ] API client function for watch history
-   [ ] Error handling for all API calls
-   [ ] Loading states
-   [ ] Debounced search implementation
-   [ ] Job status polling with refetch strategy
-   [ ] Video player state management
-   [ ] Fetch movie mutation with cache invalidation

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design (mobile, tablet, desktop)
-   [ ] Loading/error states
-   [ ] Empty states
-   [ ] Movie poster image handling using TMDB image URL helper
-   [ ] Placeholder images for missing posters/profiles
-   [ ] Status indicator colors and styling
-   [ ] Progress bar animations
-   [ ] Release selector modal/list styling
-   [ ] Watch history list styling with deleted badges
-   [ ] Last watched timestamp formatting

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.yml)
-   [ ] Handle errors gracefully with user-friendly messages
-   [ ] Implement TMDB image URL helper (`lib/tmdb.ts`)
-   [ ] Use image URL helper for all TMDB images (posters, backdrops, profiles)
-   [ ] HTML5 video player integration
-   [ ] Video streaming from cloud storage URLs
-   [ ] Real-time job status polling
-   [ ] Automatic watch button enablement when job is ready
-   [ ] Extract movie ID from job when navigating to player (always use movie ID, not job ID)
-   [ ] Watch history display with pagination or infinite scroll
-   [ ] Handle deleted movies in history (show badge, disable watch)

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks
-   HTML5 video element for playback

### Utilities

-   `lib/tmdb.ts`: TMDB image URL construction helper

## Performance Considerations

-   Debounce search input to reduce API calls (300-500ms delay)
-   Use TanStack Query caching to avoid redundant API calls
-   Lazy load images for movie posters and backdrops
-   Implement pagination to limit initial data load
-   Use React.memo for MovieCard component to prevent unnecessary re-renders
-   Video streaming with range requests support for seeking
-   Lazy load video player component to reduce initial bundle size
-   Optimize video loading with preload strategies (preload="metadata")
-   Poll job status with smart refetch intervals (stop when complete)
-   Cache job status queries to reduce unnecessary updates
-   Debounce or throttle resize events for responsive player

## Accessibility

-   Semantic HTML: Use proper heading hierarchy, article/section elements
-   ARIA labels: Label search input, pagination controls, movie cards, video player controls
-   Keyboard navigation: Support keyboard shortcuts for movie cards, pagination, and video player (space for play/pause, arrow keys for seek)
-   Screen reader support: Provide alt text for movie posters, announce search results count, describe video player state
-   Focus management: Ensure focus moves appropriately when navigating between pages
-   Video accessibility: Support captions/subtitles if available, provide video controls with proper labels

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.
