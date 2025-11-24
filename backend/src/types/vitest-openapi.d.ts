import type { OpenAPIV3_1 } from "openapi-types";
import type { ExpectationResult } from "vitest";

type OpenAPISpecObject = OpenAPIV3_1.Document;

declare module "vitest-openapi" {
    export function toSatisfyApiSpec(
        received: unknown,
        spec: string | OpenAPISpecObject
    ): ExpectationResult;
    export function toSatisfySchemaInApiSpec(
        received: unknown,
        schemaName: string,
        spec: string | OpenAPISpecObject
    ): ExpectationResult;
}

declare module "vitest" {
    interface Assertion {
        toSatisfyApiSpec(spec: string | OpenAPISpecObject): void;
        toSatisfySchemaInApiSpec(
            schemaName: string,
            spec: string | OpenAPISpecObject
        ): void;
    }
    interface AsymmetricMatchersContaining {
        toSatisfyApiSpec(spec: string | OpenAPISpecObject): void;
        toSatisfySchemaInApiSpec(
            schemaName: string,
            spec: string | OpenAPISpecObject
        ): void;
    }
}
