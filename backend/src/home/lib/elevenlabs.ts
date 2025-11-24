const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const VOICE_ID = "lhTvHflPVOqgSWyuWQry";
const OUTPUT_FORMAT = "mp3_44100_128";
const MODEL_ID = "eleven_flash_v2_5";

interface ElevenLabsTtsRequest {
    text: string;
    model_id: string;
    voice_settings?: {
        stability?: number;
        similarity_boost?: number;
        speed?: number;
    };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

export async function synthesizeYandereAgentAudio(
    apiKey: string,
    text: string
): Promise<string> {
    if (!apiKey || apiKey.trim() === "") {
        throw new Error("ElevenLabs API key is required");
    }

    const requestBody: ElevenLabsTtsRequest = {
        text,
        model_id: MODEL_ID,
        voice_settings: {
            stability: 0,
            similarity_boost: 0.55,
            speed: 1.05,
        },
    };

    const requestUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
            `ElevenLabs TTS error: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    const audioBuffer = await response.arrayBuffer();
    return arrayBufferToBase64(audioBuffer);
}
