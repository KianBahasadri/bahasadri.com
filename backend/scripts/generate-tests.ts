/* eslint-disable no-console */
// Auto-generates contract tests from OpenAPI YAML files
// Run: pnpm generate-tests

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { glob } from "glob";
import type { OpenAPIV3_1 } from "openapi-types";

type OpenAPISpec = OpenAPIV3_1.Document;

interface Endpoint {
    path: string;
    method: string;
    operationId?: string;
    summary?: string;
    requestBody?: unknown;
    pathParameters: Record<string, unknown>;
    responses: string[];
}

const FEATURES_DIR = path.resolve(
    path.join(process.cwd(), "..", "docs", "features")
);
const OUTPUT_DIR = path.resolve(
    path.join(process.cwd(), "src", "__tests__", "contract")
);

function validatePathWithinDirectory(
    filePath: string,
    allowedDir: string
): string {
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(allowedDir);
    if (!resolvedPath.startsWith(resolvedDir)) {
        throw new Error(
            `Path ${resolvedPath} is not within allowed directory ${resolvedDir}`
        );
    }
    return resolvedPath;
}

function extractFeatureName(yamlPath: string): string {
    const parts = yamlPath.split("/");
    const featuresIndex = parts.indexOf("features");
    return parts[featuresIndex + 1] ?? "unknown";
}

function hasJsonContent(
    requestBody: OpenAPIV3_1.RequestBodyObject
): requestBody is OpenAPIV3_1.RequestBodyObject & {
    content: { "application/json": OpenAPIV3_1.MediaTypeObject };
} {
    return "application/json" in requestBody.content;
}

function getPropertyValue(prop: OpenAPIV3_1.SchemaObject): unknown {
    switch (prop.type) {
        case "string": {
            return "";
        }
        case "number":
        case "integer": {
            return 0;
        }
        case "boolean": {
            return false;
        }
        case "array": {
            return [];
        }
        default: {
            return {};
        }
    }
}

function getExampleFromSchema(schema: OpenAPIV3_1.SchemaObject): unknown {
    if (schema.required) {
        const minimal: Record<string, unknown> = {};
        for (const field of schema.required) {
            const prop = schema.properties?.[field];
            if (prop && "type" in prop && !("$ref" in prop)) {
                minimal[field] = getPropertyValue(prop);
            }
        }
        return minimal;
    }
    return {};
}

function extractRequestBodyExample(
    requestBody: OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject
): unknown {
    // Handle $ref references (would need to resolve, but for now skip)
    if ("$ref" in requestBody) {
        return {};
    }
    if (!hasJsonContent(requestBody)) {
        return {};
    }
    const jsonContent = requestBody.content["application/json"];

    // Try to get example from requestBody
    if (jsonContent.example) {
        return jsonContent.example;
    }

    // Try to get example from schema
    const schema = jsonContent.schema as OpenAPIV3_1.SchemaObject | undefined;
    if (schema?.example) {
        return schema.example;
    }

    // Try to get from examples object
    if (jsonContent.examples) {
        const examplesArray = Object.values(jsonContent.examples);
        if (examplesArray.length > 0) {
            const firstExample = examplesArray[0];
            if ("value" in firstExample) {
                return firstExample.value;
            }
        }
    }

    // Generate minimal object from required fields
    if (schema && "properties" in schema) {
        return getExampleFromSchema(schema);
    }

    return {};
}

function getDefaultExample(schema: OpenAPIV3_1.SchemaObject): unknown {
    if (schema.format === "uuid") {
        return "550e8400-e29b-41d4-a716-446655440000";
    }
    switch (schema.type) {
        case "string": {
            return "example";
        }
        case "integer":
        case "number": {
            return 1;
        }
        case "boolean": {
            return true;
        }
        default: {
            return "example";
        }
    }
}

function extractPathParameterExample(
    param: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject,
    spec: OpenAPISpec
): unknown {
    // Handle $ref references
    let paramObj: OpenAPIV3_1.ParameterObject;
    if ("$ref" in param) {
        // Simple $ref resolution (assumes components/parameters/...)
        const refPath = param.$ref.replace("#/components/parameters/", "");
        const resolvedParam = spec.components?.parameters?.[refPath] as
            | OpenAPIV3_1.ParameterObject
            | undefined;
        if (!resolvedParam) {
            return undefined;
        }
        paramObj = resolvedParam;
    } else {
        paramObj = param;
    }

    const schema = paramObj.schema as OpenAPIV3_1.SchemaObject | undefined;

    // Try to get example from parameter
    if (paramObj.example !== undefined) {
        return paramObj.example;
    }

    // Try to get example from schema
    if (schema?.example !== undefined) {
        return schema.example;
    }

    // Try to get from examples object
    if (paramObj.examples) {
        const firstExample = Object.values(paramObj.examples)[0];
        if ("value" in firstExample) {
            return firstExample.value;
        }
    }

    // Generate example based on schema type and format
    if (schema) {
        return getDefaultExample(schema);
    }

    return "example";
}

function extractPathParameters(
    path: string,
    operation: OpenAPIV3_1.OperationObject,
    pathItem: OpenAPIV3_1.PathItemObject,
    spec: OpenAPISpec
): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    // Extract parameter names from path (e.g., {fileId} -> fileId)
    // Using a safer regex pattern that avoids backtracking
    const pathParamMatches = path.match(/\{\w+\}/g);
    if (!pathParamMatches) {
        return params;
    }

    // Combine path-level and operation-level parameters
    const allParameters = [
        ...(pathItem.parameters ?? []),
        ...(operation.parameters ?? []),
    ];

    for (const paramMatch of pathParamMatches) {
        const paramName = paramMatch.slice(1, -1); // Remove { and }

        // Find the parameter definition
        const paramDef = allParameters.find(
            (p) =>
                ("name" in p ? p.name === paramName : false) &&
                ("in" in p ? p.in === "path" : false)
        );

        if (paramDef) {
            const example = extractPathParameterExample(paramDef, spec);
            if (example !== undefined) {
                params[paramName] = example;
            }
        } else {
            // Fallback: use a default example if parameter not defined
            params[paramName] = "example";
        }
    }

    return params;
}

function substitutePathParameters(
    path: string,
    parameters: Record<string, unknown>
): string {
    let substitutedPath = path;
    for (const [paramName, value] of Object.entries(parameters)) {
        substitutedPath = substitutedPath.replace(
            `{${paramName}}`,
            String(value)
        );
    }
    return substitutedPath;
}

function extractEndpoints(spec: OpenAPISpec): Endpoint[] {
    const endpoints: Endpoint[] = [];

    if (!spec.paths) {
        return endpoints;
    }

    for (const [path, pathItem] of Object.entries(spec.paths)) {
        if (!pathItem) {
            continue;
        }

        const methods = ["get", "post", "put", "patch", "delete"] as const;
        for (const method of methods) {
            const operation = pathItem[method];
            if (!operation) {
                continue;
            }

            const responses = Object.keys(operation.responses);
            const pathParameters = extractPathParameters(
                path,
                operation,
                pathItem,
                spec
            );

            endpoints.push({
                path,
                method: method.toUpperCase(),
                operationId: operation.operationId,
                summary: operation.summary,
                requestBody: operation.requestBody
                    ? extractRequestBodyExample(operation.requestBody)
                    : undefined,
                pathParameters,
                responses,
            });
        }
    }

    return endpoints;
}

function generateTestFile(featureName: string, endpoints: Endpoint[]): string {
    const testCases = endpoints
        .map((endpoint) => {
            const routePath = endpoint.path.startsWith("/")
                ? endpoint.path
                : `/${endpoint.path}`;

            // Substitute path parameters with examples
            const substitutedPath = substitutePathParameters(
                routePath,
                endpoint.pathParameters
            );
            const apiPath = `/api${substitutedPath}`;
            const testName =
                endpoint.operationId ?? `${endpoint.method} ${apiPath}`;

            let requestCode = "";
            if (endpoint.requestBody) {
                const bodyJson = JSON.stringify(
                    endpoint.requestBody,
                    undefined,
                    8
                );
                requestCode = `
        const res = await app.request("${apiPath}", {
            method: "${endpoint.method}",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(${bodyJson}),
        });`;
            } else {
                requestCode = `
        const res = await app.request("${apiPath}", {
            method: "${endpoint.method}",
        });`;
            }

            // Use toBeOneOf for status codes (vitest doesn't have this, so we'll use a helper)
            const statusCodes = endpoint.responses.join(", ");
            return `
    it("${testName} satisfies OpenAPI spec", async () => {
        ${requestCode}
        expect([${statusCodes}]).toContain(res.status);
        const formattedRes = await formatResponseForValidation(res, "${apiPath}", "${endpoint.method}");
        expect(formattedRes).toSatisfyApiSpec(openapiSpec);
    });`;
        })
        .join("\n");

    return `/**
 * Auto-generated contract tests for ${featureName}
 * 
 * DO NOT EDIT THIS FILE MANUALLY
 * Regenerate with: pnpm generate-tests
 */

import { describe, it, expect } from "vitest";
import vitestOpenAPI from "vitest-openapi";
import app from "../../index";
import { loadOpenAPISpec } from "../helpers/load-openapi";
import { formatResponseForValidation } from "../helpers/format-response";

const openapiSpec = loadOpenAPISpec("${featureName}");
vitestOpenAPI(openapiSpec);

describe("${featureName} API Contract Tests", () => {
${testCases}
});
`;
}

async function main(): Promise<void> {
    console.log("🔍 Scanning for OpenAPI specs...");

    const yamlFiles = await glob(path.join(FEATURES_DIR, "*/API_CONTRACT.yml"));

    if (yamlFiles.length === 0) {
        console.error("❌ No API_CONTRACT.yml files found in docs/features/");
        throw new Error("No API_CONTRACT.yml files found");
    }

    console.log(`📄 Found ${String(yamlFiles.length)} OpenAPI spec(s)\n`);

    // Ensure output directory exists
    mkdirSync(OUTPUT_DIR, { recursive: true });

    let totalEndpoints = 0;

    for (const yamlPath of yamlFiles) {
        const featureName = extractFeatureName(yamlPath);
        console.log(`📝 Processing ${featureName}...`);

        try {
            const validatedYamlPath = validatePathWithinDirectory(
                yamlPath,
                FEATURES_DIR
            );
            const yamlContent = readFileSync(validatedYamlPath, "utf8");
            const spec = parse(yamlContent) as OpenAPISpec;

            if (!spec.paths) {
                console.warn(`  ⚠️  No paths found in ${featureName}`);
                continue;
            }

            const endpoints = extractEndpoints(spec);
            totalEndpoints += endpoints.length;

            if (endpoints.length === 0) {
                console.warn(`  ⚠️  No endpoints found in ${featureName}`);
                continue;
            }

            const testContent = generateTestFile(featureName, endpoints);
            const outputPath = path.join(
                OUTPUT_DIR,
                `${featureName}.contract.test.ts`
            );
            const validatedOutputPath = validatePathWithinDirectory(
                outputPath,
                OUTPUT_DIR
            );
            writeFileSync(validatedOutputPath, testContent, "utf8");

            console.log(
                `  ✅ Generated ${String(
                    endpoints.length
                )} test(s) → ${path.basename(outputPath)}`
            );
        } catch (error: unknown) {
            console.error(`  ❌ Error processing ${featureName}:`, error);
        }
    }

    console.log(`\n✨ Generated ${String(totalEndpoints)} total test case(s)`);
    console.log(`📁 Test files written to: ${OUTPUT_DIR}`);
}

void main().catch((error: unknown) => {
    console.error("Fatal error:", error);
    throw error;
});
