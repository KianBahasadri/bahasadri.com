/**
 * Script to create the global room and update the constant
 *
 * Usage: ts-node scripts/create-global-room.ts
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_REALTIME_APP_ID, and CLOUDFLARE_REALTIME_API_TOKEN environment variables
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const APP_ID = process.env.CLOUDFLARE_REALTIME_APP_ID;
const API_TOKEN = process.env.CLOUDFLARE_REALTIME_API_TOKEN;

if (!ACCOUNT_ID) {
    console.error("Error: CLOUDFLARE_ACCOUNT_ID environment variable is required");
    process.exit(1);
}

if (!APP_ID) {
    console.error("Error: CLOUDFLARE_REALTIME_APP_ID environment variable is required");
    process.exit(1);
}

if (!API_TOKEN) {
    console.error("Error: CLOUDFLARE_REALTIME_API_TOKEN environment variable is required");
    process.exit(1);
}

async function createGlobalRoom(): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/realtime/kit/${APP_ID}/meetings`;

    console.log("Creating global room...");

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: "Global Video Commander Room",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to create room: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const data = (await response.json()) as {
        success: boolean;
        data?: { id?: string };
    };

    if (!data.success || !data.data?.id) {
        throw new Error(
            `Invalid response from API: ${JSON.stringify(data)}`
        );
    }

    return data.data.id;
}

async function updateGlobalRoomId(roomId: string): Promise<void> {
    const filePath = join(
        __dirname,
        "../api/tools/video-commander/global-room/route.ts"
    );

    let content = readFileSync(filePath, "utf-8");
    content = content.replace(
        /const GLOBAL_ROOM_ID = ".*";/,
        `const GLOBAL_ROOM_ID = "${roomId}";`
    );

    writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Updated GLOBAL_ROOM_ID to: ${roomId}`);
}

async function main(): Promise<void> {
    try {
        const roomId = await createGlobalRoom();
        console.log(`✅ Created room with ID: ${roomId}`);
        await updateGlobalRoomId(roomId);
        console.log("✅ Done!");
    } catch (error) {
        console.error("❌ Error:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

void main();

