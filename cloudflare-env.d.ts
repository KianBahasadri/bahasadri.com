/// <reference types="@cloudflare/workers-types" />

export {};

declare global {
    /**
     * Cloudflare Worker bindings available to the application at runtime.
     */
    interface CloudflareEnv {
        /**
         * KV namespace that stores SMS Commander message history.
         */
        SMS_MESSAGES: KVNamespace;
    }
}
