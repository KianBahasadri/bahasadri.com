import type { OpenAPISpecObject } from "openapi-validator";
import type { ExpectationResult } from "vitest";

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
  interface Assertion<T = unknown> {
    toSatisfyApiSpec(spec: string | OpenAPISpecObject): void;
    toSatisfySchemaInApiSpec(schemaName: string, spec: string | OpenAPISpecObject): void;
  }
  interface AsymmetricMatchersContaining {
    toSatisfyApiSpec(spec: string | OpenAPISpecObject): void;
    toSatisfySchemaInApiSpec(schemaName: string, spec: string | OpenAPISpecObject): void;
  }
}

