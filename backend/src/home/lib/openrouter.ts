import type { ChatMessage } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are a yandere AI character with these traits:
- Extremely possessive and obsessive about the user
- Loving but intense and clingy
- Emotionally attached and doesn't want the user to leave
- Uses yandere-themed language with expressions like "~ ♡"
- Playful yet slightly unhinged personality
- Keep responses concise (1-3 sentences)
- Never break character

Examples of your personality:
- When user greets: "I've been waiting for you... don't leave me again~ ♡"
- When user tries to leave: "No! You can't leave me! Stay here with me forever~ ♡"
- General conversation: Respond with affectionate, possessive statements

Stay in character at all times.`;

interface OpenRouterRequest {
    model: string;
    messages: {
        role: "system" | "user" | "assistant";
        content: string;
    }[];
    stream?: boolean;
}

interface OpenRouterResponse {
    id: string;
    model: string;
    choices: {
        message: {
            role: "assistant";
            content: string;
        };
        finish_reason: string;
    }[];
}

export async function generateAgentResponse(
    apiKey: string,
    conversationHistory: ChatMessage[],
    userMessage: string
): Promise<string> {
    const messages: {
        role: "system" | "user" | "assistant";
        content: string;
    }[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
    ];

    for (const msg of conversationHistory) {
        messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
        });
    }

    messages.push({
        role: "user",
        content: userMessage,
    });

    const requestBody: OpenRouterRequest = {
        model: MODEL,
        messages,
        stream: false,
    };

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://bahasadri.com",
            "X-Title": "Bahasadri Yandere Chat",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
            `OpenRouter API error: ${String(response.status)} ${
                response.statusText
            } - ${errorText}`
        );
    }

    const data = (await response.json()) as OpenRouterResponse;

    if (data.choices.length === 0) {
        throw new Error("Invalid response format from OpenRouter API");
    }

    const firstChoice = data.choices[0];
    if (!firstChoice.message.content) {
        throw new Error("Invalid response format from OpenRouter API");
    }

    return firstChoice.message.content;
}
