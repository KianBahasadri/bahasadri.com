# Movies on Demand - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Movies on Demand utility. Provides a user interface for searching movies, browsing popular and trending films, viewing movie details, and discovering similar movies using The Movie Database (TMDB) API.

## Code Location

`frontend/src/pages/movies-on-demand/`

## API Contract Reference

See `docs/features/movies-on-demand/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/movies-on-demand`

**Component**: `MoviesOnDemand.tsx`

**Description**: Main page for movies on demand utility

**Route Configuration**:

```typescript
<Route path="/movies-on-demand" element={<MoviesOnDemand />} />
```

### `/movies-on-demand/movies/:id`

**Component**: `MovieDetails.tsx`

**Description**: Movie details page showing comprehensive information about a specific movie

**Route Configuration**:

```typescript
<Route path="/movies-on-demand/movies/:id" element={<MovieDetails />} />
```

### `/movies-on-demand/movies/:id/watch`

**Component**: `MoviePlayer.tsx`

**Description**: Movie player page for streaming and watching movies

**Route Configuration**:

```typescript
<Route path="/movies-on-demand/movies/:id/watch" element={<MoviePlayer />} />
```

## Components

### MoviesOnDemand (Main Page)

**Location**: `MoviesOnDemand.tsx`

**Purpose**: Main page component that provides movie search, browsing popular/trending movies, and navigation to movie details

**State**:

-   Server state: TanStack Query for movie search, popular movies, trending movies
-   Local state: Search query input, active tab (search/popular/trending), current page

**Layout**:

-   Search bar at the top
-   Tabs or sections for Search, Popular, and Trending
-   Movie grid/list displaying movie cards
-   Pagination controls

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

**Purpose**: Displays comprehensive movie information including poster, backdrop, cast, crew, and similar movies

**State**:

-   Server state: TanStack Query for movie details and similar movies
-   Local state: None

**Layout**:

-   Hero section with backdrop image and movie poster
-   Movie title, release date, runtime, genres
-   Overview/plot summary
-   Cast section with actor photos and character names
-   Crew section with key personnel
-   Similar movies section
-   Production information

**Interactions**:

-   Click on similar movie to navigate to its details page
-   Click on cast/crew member (if implemented) to view their profile
-   Click "Watch Movie" button to navigate to movie player
-   Click "Host Movie" button to upload/host a movie for streaming
-   View streaming service availability badges

**Styling**:

-   CSS Modules: `MovieDetails.module.css`
-   Responsive layout with hero section
-   Grid layout for cast and similar movies
-   Watch providers section with service logos

### MoviePlayer (Watch Page)

**Location**: `MoviePlayer.tsx`

**Purpose**: Full-featured video player for streaming and watching movies

**State**:

-   Server state: TanStack Query for movie stream URL
-   Local state: Video player state (playing, volume, current time, etc.)

**Layout**:

-   Full-screen or embedded video player
-   Video controls overlay (play/pause, seek bar, volume, fullscreen)
-   Movie information overlay (optional)
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

### WatchProviders

**Location**: `components/WatchProviders/WatchProviders.tsx`

**Purpose**: Displays streaming service availability for a movie

**Props**:

```typescript
interface WatchProvidersProps {
    providers: WatchProvidersData | null;
    movieId: number;
}
```

**State**:

-   Server state: TanStack Query for watch providers

**Interactions**:

-   Click on provider logo to view more information (optional)

**Styling**:

-   CSS Modules: `WatchProviders.module.css`
-   Grid layout for provider logos
-   Service type badges (Stream, Rent, Buy)

### HostMovieForm

**Location**: `components/HostMovieForm/HostMovieForm.tsx`

**Purpose**: Form for uploading or providing URL to host a movie

**Props**:

```typescript
interface HostMovieFormProps {
    movieId: number;
    onSuccess?: (streamUrl: string) => void;
    onCancel?: () => void;
}
```

**State**:

-   Local state: Form input (URL or file), loading state
-   Server state: TanStack Query mutation for hosting movie

**Interactions**:

-   Enter URL or select file
-   Submit form to host movie
-   Cancel hosting

**Styling**:

-   CSS Modules: `HostMovieForm.module.css`
-   Form layout with file input or URL input

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    search: (query: string, page: number) =>
        ["movies-on-demand", "search", query, page] as const,
    popular: (page: number) =>
        ["movies-on-demand", "popular", page] as const,
    trending: (page: number) =>
        ["movies-on-demand", "trending", page] as const,
    details: (id: number) =>
        ["movies-on-demand", "details", id] as const,
    similar: (id: number, page: number) =>
        ["movies-on-demand", "similar", id, page] as const,
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

const useTrendingMovies = (page: number) => {
    return useQuery({
        queryKey: queryKeys.trending(page),
        queryFn: () => getTrendingMovies(page),
    });
};

const useMovieDetails = (id: number) => {
    return useQuery({
        queryKey: queryKeys.details(id),
        queryFn: () => getMovieDetails(id),
    });
};

const useSimilarMovies = (id: number, page: number) => {
    return useQuery({
        queryKey: queryKeys.similar(id, page),
        queryFn: () => getSimilarMovies(id, page),
    });
};

const useMovieWatchProviders = (id: number) => {
    return useQuery({
        queryKey: ["movies-on-demand", "watch-providers", id] as const,
        queryFn: () => getMovieWatchProviders(id),
    });
};

const useMovieStream = (id: string, externalUrl?: string) => {
    return useQuery({
        queryKey: ["movies-on-demand", "stream", id, externalUrl] as const,
        queryFn: () => getMovieStream(id, externalUrl),
        enabled: !!id,
    });
};

const useHostMovie = () => {
    return useMutation({
        mutationFn: (data: HostMovieRequest) => hostMovie(data),
    });
};
```

### Local State (React)

```typescript
// Search query input
const [searchQuery, setSearchQuery] = useState<string>("");

// Active tab/view
const [activeView, setActiveView] = useState<"search" | "popular" | "trending">(
    "popular"
);

// Current page for pagination
const [currentPage, setCurrentPage] = useState<number>(1);

// Video player state
const [isPlaying, setIsPlaying] = useState<boolean>(false);
const [currentTime, setCurrentTime] = useState<number>(0);
const [volume, setVolume] = useState<number>(1);
const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Search movies
export const searchMovies = async (
    query: string,
    page: number = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/search?query=${encodeURIComponent(query)}&page=${page}`,
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
    const response = await fetch(
        `/api/movies-on-demand/popular?page=${page}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get popular movies");
    }

    return response.json();
};

// Get trending movies
export const getTrendingMovies = async (
    page: number = 1
): Promise<MovieSearchResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/trending?page=${page}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get trending movies");
    }

    return response.json();
};

// Get movie details
export const getMovieDetails = async (
    id: number
): Promise<MovieDetails> => {
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

// Get movie watch providers
export const getMovieWatchProviders = async (
    id: number
): Promise<WatchProvidersResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/movies/${id}/watch-providers`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get watch providers");
    }

    return response.json();
};

// Get movie stream URL
export const getMovieStream = async (
    id: string,
    externalUrl?: string
): Promise<MovieStreamResponse> => {
    const url = new URL(`/api/movies-on-demand/movies/${id}/stream`, window.location.origin);
    if (externalUrl) {
        url.searchParams.set("url", externalUrl);
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get movie stream");
    }

    return response.json();
};

// Host a movie
export const hostMovie = async (
    data: HostMovieRequest
): Promise<HostMovieResponse> => {
    const response = await fetch(
        `/api/movies-on-demand/movies/${data.movieId}/host`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to host movie");
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
    -   Flow: Navigate to details page → Load movie details and similar movies
    -   Error handling: Show error message if movie not found

-   **Browse Popular/Trending**:
    -   Trigger: Click on Popular or Trending tab
    -   Flow: Load appropriate movie list → Display results
    -   Error handling: Show error message if API call fails

-   **Pagination**:
    -   Trigger: Click on page number or next/previous buttons
    -   Flow: Update page state → Reload movie list for new page
    -   Error handling: Handle pagination errors gracefully

-   **Watch Movie**:
    -   Trigger: Click "Watch Movie" button on movie details page
    -   Flow: Navigate to player → Fetch stream URL → Load video player → Start playback
    -   Error handling: Show error if stream URL unavailable, allow external URL input

-   **Host Movie**:
    -   Trigger: Click "Host Movie" button on movie details page
    -   Flow: Open form → Enter URL or select file → Submit → Upload/download → Get stream URL
    -   Error handling: Show error if upload/download fails, validate URL/file format

### Form Handling

-   Search input with debouncing (300-500ms delay)
-   No form submission needed - search happens automatically
-   Host movie form with URL input or file upload
-   Video player controls with state management

## UI/UX Requirements

### Layout

-   Responsive grid layout for movie cards
-   Search bar prominently displayed at top
-   Tab navigation for Search/Popular/Trending views
-   Movie details page with hero section and content sections

### Visual Design

-   Movie posters displayed prominently in cards
-   Rating badges visible on movie cards
-   Backdrop images for movie details hero section
-   Clean, modern card-based design
-   Hover effects on interactive elements

### User Feedback

-   Loading states: Skeleton loaders for movie cards during API calls
-   Error messages: Clear error messages displayed when API calls fail
-   Success feedback: Smooth transitions when content loads
-   Empty states: Friendly messages when no search results found
-   Pagination: Clear indication of current page and total pages

## Implementation Checklist

### Components

-   [ ] MoviesOnDemand page component
-   [ ] MovieDetails page component
-   [ ] MoviePlayer page component
-   [ ] MovieCard component
-   [ ] MovieSearch component
-   [ ] MovieList component
-   [ ] WatchProviders component
-   [ ] HostMovieForm component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration
-   [ ] Movie details page route configuration
-   [ ] Movie player page route configuration

### State Management

-   [ ] TanStack Query setup for all endpoints
-   [ ] API client functions
-   [ ] Error handling
-   [ ] Loading states
-   [ ] Debounced search implementation
-   [ ] Video player state management
-   [ ] Host movie mutation

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Empty states
-   [ ] Movie poster image handling (TMDB image URLs)

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.yml)
-   [ ] Handle errors gracefully
-   [ ] Implement image URL construction for TMDB posters/backdrops
-   [ ] HTML5 video player integration
-   [ ] Video streaming from URLs or hosted files
-   [ ] File upload handling for movie hosting

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks
-   HTML5 video element for playback

## Performance Considerations

-   Debounce search input to reduce API calls
-   Use TanStack Query caching to avoid redundant API calls
-   Lazy load images for movie posters
-   Implement pagination to limit initial data load
-   Use React.memo for MovieCard component if needed
-   Video streaming with range requests support
-   Lazy load video player component
-   Optimize video loading with preload strategies

## Accessibility

-   Semantic HTML: Use proper heading hierarchy, article/section elements
-   ARIA labels: Label search input, pagination controls, movie cards, video player controls
-   Keyboard navigation: Support keyboard shortcuts for movie cards, pagination, and video player (space for play/pause, arrow keys for seek)
-   Screen reader support: Provide alt text for movie posters, announce search results count, describe video player state
-   Focus management: Ensure focus moves appropriately when navigating between pages
-   Video accessibility: Support captions/subtitles if available, provide video controls with proper labels

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.

