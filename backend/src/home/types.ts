export interface WelcomeResponse {
    message: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    code: "INVALID_INPUT" | "INTERNAL_ERROR";
}

