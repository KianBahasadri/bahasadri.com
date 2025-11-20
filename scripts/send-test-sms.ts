/**
 * Manual SMS Commander smoke test script.
 *
 * Sends a single SMS via the shared `sendSmsViaTwilio` helper using CLI
 * arguments so engineers can confirm live credentials without touching the
 * automated Vitest suite. This script intentionally bypasses mocks—only run it
 * when you have explicit permission to hit the real Twilio account.
 *
 * Usage:
 * ```bash
 * pnpm sms:smoke --to "+16478068912" --body "Message body"
 * ```
 *
 * @see ../docs/AI_AGENT_STANDARDS.md - Mandatory documentation for AI agents
 * @see ../docs/DEVELOPMENT.md - Repository tooling and scripts
 * @see ../app/tools/sms-commander/PLAN.md - Utility planning details
 */

import { sendSmsViaTwilio } from "../app/tools/sms-commander/lib/twilio";

interface SmokeArgs {
    body?: string;
    to?: string;
}

function parseArgs(argv: string[]): SmokeArgs {
    const parsed: SmokeArgs = {};

    for (let i = 0; i < argv.length; i += 1) {
        const current = argv[i];
        const next = argv[i + 1];

        if (current === "--to") {
            parsed.to = next;
            i += 1;
        } else if (current === "--body") {
            parsed.body = next;
            i += 1;
        }
    }

    return parsed;
}

async function main(): Promise<void> {
    const { to, body } = parseArgs(process.argv.slice(2));

    if (!to || !body) {
        throw new Error(
            'Missing CLI args. Usage: pnpm sms:smoke --to "+16478068912" --body "Message"'
        );
    }

    const message = await sendSmsViaTwilio({
        phoneNumber: to,
        message: body,
    });

    // eslint-disable-next-line no-console -- intentional CLI output
    console.log(
        `SMS dispatched to ${message.phoneNumber} with SID ${message.twilioSid ?? message.id}`
    );
}

main().catch((error) => {
    // eslint-disable-next-line no-console -- intentional CLI output
    console.error("Failed to send smoke-test SMS:", error);
    process.exit(1);
});

