import type { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
    SMS_MESSAGES: KVNamespace;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
}
