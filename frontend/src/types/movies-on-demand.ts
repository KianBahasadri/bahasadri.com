export interface Movie {
    id: number;
    title: string;
    overview?: string;
    release_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface ProductionCompany {
    id: number;
    name: string;
    logo_path?: string | null;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path?: string | null;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    profile_path?: string | null;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface JobStatusInfo {
    job_id: string;
    status: "queued" | "starting" | "downloading" | "ready" | "error";
    progress?: number;
    error_message?: string | null;
}

export interface MovieDetails extends Movie {
    runtime?: number | null;
    genres?: Genre[];
    production_companies?: ProductionCompany[];
    budget?: number;
    revenue?: number;
    credits?: Credits;
    imdb_id?: string | null;
    job_status?: JobStatusInfo | null;
}

export interface MovieSearchResponse {
    results: Movie[];
    total_results: number;
    page: number;
    total_pages: number;
}

export interface SimilarMoviesResponse {
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;
}

export interface UsenetRelease {
    id: string;
    title: string;
    size: number;
    quality?: string;
    resolution?: string | null;
    codec?: string | null;
    source?: string | null;
    group?: string | null;
    nzb_url: string;
}

export interface ReleasesResponse {
    releases: UsenetRelease[];
    total: number;
}

export interface JobStatus {
    job_id: string;
    movie_id: number;
    status:
        | "queued"
        | "starting"
        | "downloading"
        | "ready"
        | "error"
        | "deleted";
    progress?: number | null;
    error_message?: string | null;
    release_title?: string | null;
    created_at: string;
    updated_at: string;
    ready_at?: string | null;
    expires_at?: string | null;
    last_watched_at?: string | null;
}

export interface WatchHistoryItem {
    movie_id: number;
    title: string;
    poster_path?: string | null;
    last_watched_at: string;
    job_id?: string | null;
    status?: "ready" | "deleted" | null;
}

export interface WatchHistoryResponse {
    movies: WatchHistoryItem[];
    total: number;
}

export interface StreamResponse {
    stream_url: string;
    content_type: string;
    file_size?: number | null;
}

export interface FetchMovieRequest {
    mode: "auto" | "manual";
    release_id?: string | null;
    quality_preference?: string | null;
}

export interface FetchMovieResponse {
    job_id: string;
    status: "queued" | "downloading" | "ready";
    releases?: UsenetRelease[] | null;
}
