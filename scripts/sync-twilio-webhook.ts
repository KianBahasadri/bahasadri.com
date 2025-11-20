/**
 * Deployment hook to ensure Twilio forwards inbound SMS to the correct webhook.
 *
 * This script should run once per deploy (via pnpm sync:twilio-webhook or in CI).
 * It verifies that the configured Twilio phone number points to the expected
 * webhook URL and updates the phone number if it does not.
 */

import twilio from "twilio";

const DEFAULT_WEBHOOK_URL =
    "https://bahasadri.com/api/tools/sms-commander/webhook";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function normalizeUrl(url: string): string {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
}

async function syncTwilioWebhook(): Promise<void> {
    const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
    const authToken = requireEnv("TWILIO_AUTH_TOKEN");
    const phoneNumber = requireEnv("TWILIO_PHONE_NUMBER");
    const expectedWebhookUrl =
        process.env.TWILIO_WEBHOOK_URL ?? DEFAULT_WEBHOOK_URL;

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
    const currentUrl = record.smsUrl ?? "not set";

    const matches =
        normalizeUrl(currentUrl) === normalizeUrl(expectedWebhookUrl);

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
