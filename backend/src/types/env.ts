import type {
    KVNamespace,
    R2Bucket,
    D1Database,
    Queue,
    DurableObjectNamespace,
} from "@cloudflare/workers-types";

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
    MOVIE_DOWNLOADER: DurableObjectNamespace;
    // Movies on Demand - Container service token (for internal callbacks)
    CONTAINER_SERVICE_TOKEN_ID: string;
    CONTAINER_SERVICE_TOKEN_SECRET: string;
    // Movies on Demand - Usenet server credentials
    USENET_HOST: string;
    USENET_PORT: string;
    USENET_USERNAME: string;
    USENET_PASSWORD: string;
    USENET_CONNECTIONS: string;
    USENET_ENCRYPTION: string;
    // Movies on Demand - R2 API credentials (for container uploads)
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
}
