interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

export async function sendSMS(
    config: TwilioConfig,
    to: string,
    body: string
): Promise<{ sid: string; status: string }> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", config.phoneNumber);
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
        throw new Error(`Twilio API error: ${String(response.status)} ${errorText}`);
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

