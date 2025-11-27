interface TwilioConfig {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
}

export async function sendWhatsApp(
    config: TwilioConfig,
    to: string,
    body: string
): Promise<{ sid: string; status: string }> {
    if (!config.whatsappNumber) {
        throw new Error("WhatsApp number is not configured");
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

    // Ensure From has whatsapp: prefix if not already present
    const fromNumber = config.whatsappNumber.startsWith("whatsapp:")
        ? config.whatsappNumber
        : `whatsapp:${config.whatsappNumber}`;

    const formData = new URLSearchParams();
    formData.append("To", `whatsapp:${to}`);
    formData.append("From", fromNumber);
    formData.append("Body", body);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${btoa(
                `${config.accountSid}:${config.authToken}`
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Twilio API error: ${String(response.status)} ${errorText}`;
        
        // Provide helpful error message for common WhatsApp setup issues
        if (response.status === 400 && errorText.includes("63007")) {
            errorMessage = `WhatsApp sender not registered. The phone number "${fromNumber}" is not registered as a WhatsApp Business sender in Twilio. You need to either: 1) Use the WhatsApp Sandbox (whatsapp:+14155238886 for testing), or 2) Register your number as a WhatsApp Business sender in the Twilio Console. Original error: ${errorText}`;
        }
        
        throw new Error(errorMessage);
    }

    const data = (await response.json()) as { sid: string; status: string };
    return {
        sid: data.sid,
        status: data.status,
    };
}

export async function validateTwilioSignature(
    url: string,
    params: Record<string, string>,
    authToken: string,
    signature: string
): Promise<boolean> {
    // Create the signature string
    // Twilio requires parameters in key=value format, sorted alphabetically
    const sortedParams = Object.keys(params)
        .toSorted((a, b) => a.localeCompare(b))
        .map((key) => `${key}=${params[key]}`)
        .join("");

    const signatureString = url + sortedParams;

    // Create HMAC-SHA1 hash
    const encoder = new TextEncoder();
    const keyData = encoder.encode(authToken);
    const messageData = encoder.encode(signatureString);

    try {
        // Use Web Crypto API for HMAC
        const key = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-1" },
            false,
            ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            messageData
        );
        const hash = btoa(
            String.fromCodePoint(...new Uint8Array(signatureBuffer))
        );
        return hash === signature;
    } catch {
        return false;
    }
}
