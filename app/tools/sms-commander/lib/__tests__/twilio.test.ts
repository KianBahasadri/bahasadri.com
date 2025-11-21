/**
 * SMS Commander Twilio integration helpers test suite.
 *
 * Confirms we read credentials correctly, normalize outgoing payloads, and
 * protect webhook validation logic against tampering—all while ensuring Twilio
 * network calls are mocked so tests stay deterministic in the Workers runtime.
 *
 * @see ../../../../../docs/AI_AGENT_STANDARDS.md - Mandatory documentation
 * @see ../../../../../docs/DEVELOPMENT.md - Development workflow guidance
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message, SendSMSRequest } from "../types";
import type { TwilioConfig } from "../twilio";

const appendMessageMock = vi.fn(
    async (message: Message): Promise<Message> => message
);
const twilioMessagesCreateMock = vi.fn();

vi.mock("../messageStore", () => ({
    appendMessage: appendMessageMock,
}));

vi.mock("twilio", () => ({
    __esModule: true,
    default: vi.fn(() => ({
        messages: {
            create: twilioMessagesCreateMock,
        },
    })),
    Twilio: vi.fn(),
}));

beforeEach(async () => {
    appendMessageMock.mockClear();
    twilioMessagesCreateMock.mockReset();
    const { resetTwilioClientForTesting } = await import("../twilio");
    resetTwilioClientForTesting();
});

describe("getTwilioConfig", () => {
    it("reads environment variables", async () => {
        const { getTwilioConfig } = await import("../twilio");
        expect(getTwilioConfig()).toEqual(getDefaultTwilioConfig());
    });

    it("throws when credentials are missing", async () => {
        const restore = blankEnvVariable("TWILIO_AUTH_TOKEN");
        const { getTwilioConfig } = await import("../twilio");

        expect(() => getTwilioConfig()).toThrow(/twilio creds/i);
        restore();
    });
});

describe("sendSmsViaTwilio", () => {
    it("normalizes payloads and appends the stored message", async () => {
        const fixedDate = new Date("2025-01-01T00:00:00.000Z");
        twilioMessagesCreateMock.mockResolvedValue({
            sid: "SM123",
            to: "+15550001111",
            from: "+15559998888",
            body: "Message from Twilio",
            status: "queued",
            dateCreated: fixedDate,
        });

        const { sendSmsViaTwilio } = await import("../twilio");

        const payload: SendSMSRequest = {
            phoneNumber: "   +15550001111 ",
            message: "\nmessage to the agents ",
        };

        const storedMessage = await sendSmsViaTwilio(payload);

        const expectedConfig = getDefaultTwilioConfig();

        expect(twilioMessagesCreateMock).toHaveBeenCalledWith({
            to: "+15550001111",
            from: expectedConfig.phoneNumber,
            body: "message to the agents",
        });

        expect(appendMessageMock).toHaveBeenCalledWith(
            expect.objectContaining({
                direction: "sent",
                phoneNumber: "+15550001111",
                counterpart: "+15559998888",
                body: "Message from Twilio",
                status: "success",
            })
        );

        expect(storedMessage.timestamp).toBe(fixedDate.getTime());
    });
});

describe("storeIncomingMessage", () => {
    it("persists incoming payloads with sane defaults", async () => {
        const { storeIncomingMessage } = await import("../twilio");

        const record = await storeIncomingMessage({
            MessageSid: "SM456",
            From: "+15557771234",
            To: "+15558884567",
            Body: "stop texting me",
        });

        expect(appendMessageMock).toHaveBeenCalledWith(
            expect.objectContaining({
                direction: "received",
                phoneNumber: "+15557771234",
            })
        );
        expect(record.direction).toBe("received");
        expect(record.status).toBe("success");
    });
});

describe("validateTwilioSignature", () => {
    it("accepts the official Twilio signing algorithm", async () => {
        const url = "https://example.com/api/tools/sms-commander/webhook";
        const formData = new FormData();
        formData.set("Body", "hello agent");
        formData.set("From", "+15550001111");

        const defaults = getDefaultTwilioConfig();
        const signature = await generateTwilioSignature(
            defaults.authToken,
            url,
            formData
        );

        const request = new Request(url, {
            method: "POST",
            headers: {
                "x-twilio-signature": signature,
            },
        });

        const { validateTwilioSignature } = await import("../twilio");
        await expect(
            validateTwilioSignature(request, formData, defaults.authToken)
        ).resolves.toBe(true);
    });

    it("rejects tampered signatures", async () => {
        const url = "https://example.com/api/tools/sms-commander/webhook";
        const formData = new FormData();
        formData.set("Body", "tampered payload");

        const request = new Request(url, {
            method: "POST",
            headers: { "x-twilio-signature": "totally-fake" },
        });

        const defaults = getDefaultTwilioConfig();
        const { validateTwilioSignature } = await import("../twilio");
        await expect(
            validateTwilioSignature(request, formData, defaults.authToken)
        ).resolves.toBe(false);
    });
});

async function generateTwilioSignature(
    secret: string,
    url: string,
    formData: FormData
): Promise<string> {
    const sortedEntries = Array.from(formData.entries())
        .filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
        )
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    let dataToSign = url;
    for (const [key, value] of sortedEntries) {
        dataToSign += key + value;
    }

    const { createHmac } = await import("crypto");
    return createHmac("sha1", secret).update(dataToSign).digest("base64");
}

function getDefaultTwilioConfig(): TwilioConfig {
    return {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        phoneNumber: env.TWILIO_PHONE_NUMBER,
    };
}

function blankEnvVariable(key: TwilioEnvKey): () => void {
    const originalProcess = typeof process !== "undefined" ? process.env[key] : undefined;
    const workerEnv = env as unknown as Record<string, string>;
    const originalWorker = workerEnv[key];

    if (typeof process !== "undefined") {
        process.env[key] = "";
    }
    workerEnv[key] = "";

    return () => {
        if (typeof process !== "undefined") {
            if (originalProcess === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalProcess;
            }
        }

        if (originalWorker === undefined) {
            delete workerEnv[key];
        } else {
            workerEnv[key] = originalWorker;
        }
    };
}

