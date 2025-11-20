/**
 * Deployment hook to ensure Twilio forwards inbound SMS to the correct webhook.
 *
 * This script should run once per deploy (via pnpm sync:twilio-webhook or in CI).
 * It verifies that the configured Twilio phone number points to the expected
 * webhook URL and updates the phone number if it does not.
 *
 * @see ../docs/AI_AGENT_STANDARDS.md - Mandatory AI agent requirements
 * @see ../docs/DEVELOPMENT.md - Repository development workflow
 * @see ../docs/DEPLOYMENT.md - Cloudflare deployment process
 */

import twilio from "twilio";

const DEFAULT_WEBHOOK_URL =
    "https://bahasadri.com/api/tools/sms-commander/webhook";

/**
 * Retrieves a required environment variable or throws when missing.
 *
 * @param name - Environment variable key that must be present
 * @returns The environment variable value
 * @throws {Error} When the variable is undefined or empty
 */
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/**
 * Normalizes the provided URL string for comparison by trimming whitespace,
 * stripping hash fragments, and removing trailing slashes.
 *
 * @param url - URL string to normalize
 * @returns Normalized URL string
 */
function normalizeUrl(url: string): string {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
}

/**
 * Attempts to normalize a URL value, returning null when the value is missing
 * or not a valid URL.
 *
 * @param url - Candidate URL to normalize
 * @returns Normalized URL string or null if invalid
 */
function normalizeUrlIfValid(url: string | undefined | null): string | null {
    if (!url) {
        return null;
    }

    try {
        return normalizeUrl(url);
    } catch {
        return null;
    }
}

/**
 * Ensures the Twilio phone number forwards inbound SMS to the expected webhook.
 */
async function syncTwilioWebhook(): Promise<void> {
    const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
    const authToken = requireEnv("TWILIO_AUTH_TOKEN");
    const phoneNumber = requireEnv("TWILIO_PHONE_NUMBER");
    const expectedWebhookUrl =
        process.env.TWILIO_WEBHOOK_URL ?? DEFAULT_WEBHOOK_URL;
    const normalizedExpectedWebhookUrl = normalizeUrl(expectedWebhookUrl);

    const client = twilio(accountSid, authToken);

    console.log("🔍 Checking Twilio webhook configuration…");
    console.log(`   Phone number: ${phoneNumber}`);
    console.log(`   Expected URL: ${expectedWebhookUrl}`);

    const records = await client.incomingPhoneNumbers.list({
        phoneNumber,
        limit: 1,
    });

    if (records.length === 0) {
        throw new Error(
            `No Twilio phone number found that matches ${phoneNumber}`
        );
    }

    const record = records[0];
    const normalizedCurrentUrl = normalizeUrlIfValid(record.smsUrl);
    const matches = normalizedCurrentUrl === normalizedExpectedWebhookUrl;

    if (matches) {
        console.log("✅ Twilio is already forwarding to the correct webhook.");
        return;
    }

    console.log(
        `⚠️  Twilio webhook mismatch detected. Updating ${record.sid}…`
    );

    await client.incomingPhoneNumbers(record.sid).update({
        smsUrl: expectedWebhookUrl,
        smsMethod: "POST",
    });

    console.log("✅ Twilio webhook updated successfully.");
}

syncTwilioWebhook().catch((error) => {
    console.error("❌ Failed to synchronize Twilio webhook:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
