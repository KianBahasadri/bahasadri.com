/**
 * Helper to format Hono Response for vitest-openapi validation
 *
 * vitest-openapi expects a response object with a 'req.path' and 'req.method' properties
 * and '_json' property for the response body.
 * This function creates a plain object that matches the expected structure.
 */

export async function formatResponseForValidation(
    response: Response,
    path: string,
    method = "GET"
): Promise<{
    status: number;
    req: { path: string; method: string };
    _json: unknown;
    body: unknown;
    headers: Headers;
}> {
    const body = await response.json().catch(() => ({}));
    return {
        status: response.status,
        req: {
            path,
            method: method.toUpperCase(),
        },
        _json: body,
        body,
        headers: response.headers,
    };
}
