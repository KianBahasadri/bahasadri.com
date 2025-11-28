import type {
    KVNamespace,
    R2Bucket,
    D1Database,
    Queue,
    DurableObjectNamespace,
} from "@cloudflare/workers-types";
import type { MovieDownloaderContainer } from "../movies-on-demand/container";

export interface Env {
    SMS_MESSAGES: KVNamespace;
    WHATSAPP_MESSAGES: KVNamespace;
    HOME_CONVERSATIONS: KVNamespace;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    TWILIO_WHATSAPP_NUMBER: string;
    OPENROUTER_API_KEY: string;
    ELEVENLABS_API_KEY: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_REALTIME_ORG_ID: string;
    CLOUDFLARE_REALTIME_API_TOKEN: string;
    file_hosting_prod: R2Bucket;
    FILE_HOSTING_DB: D1Database;
    // Movies on Demand
    TMDB_API_KEY: string;
    NZBGEEK_API_KEY: string;
    MOVIES_R2: R2Bucket;
    MOVIES_D1: D1Database;
    MOVIES_QUEUE: Queue;
    // Movies on Demand - Container bindings
    MOVIE_DOWNLOADER: DurableObjectNamespace<MovieDownloaderContainer>;
    // Movies on Demand - Container service token (for internal callbacks)
    CONTAINER_SERVICE_TOKEN_ID: string;
    CONTAINER_SERVICE_TOKEN_SECRET: string;
    // Movies on Demand - Usenet credentials (shared across all servers)
    USENET_USERNAME: string;
    USENET_PASSWORD: string;
    // Movies on Demand - Server 1: Primary US server (optional overrides, defaults in container)
    USENET_SERVER1_HOST?: string;
    USENET_SERVER1_PORT?: string;
    USENET_SERVER1_CONNECTIONS?: string;
    USENET_SERVER1_ENCRYPTION?: string;
    // Movies on Demand - Server 2: EU failover server (optional overrides)
    USENET_SERVER2_HOST?: string;
    USENET_SERVER2_PORT?: string;
    USENET_SERVER2_CONNECTIONS?: string;
    USENET_SERVER2_ENCRYPTION?: string;
    // Movies on Demand - Server 3: Bonus backup server (optional overrides)
    USENET_SERVER3_HOST?: string;
    USENET_SERVER3_PORT?: string;
    USENET_SERVER3_CONNECTIONS?: string;
    USENET_SERVER3_ENCRYPTION?: string;
    // Movies on Demand - R2 API credentials (for container uploads)
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    // Optional: Environment indicator (development/production)
    ENVIRONMENT?: string;
}
