import type { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
    SMS_MESSAGES: KVNamespace;
    HOME_CONVERSATIONS: KVNamespace;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    OPENROUTER_API_KEY: string;
}
