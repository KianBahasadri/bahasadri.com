export interface CalculateRequest {
    expression: string;
}

export interface CalculateResponse {
    result: number;
    expression: string;
}

export interface ErrorResponse {
    error: string;
    code: string;
}

