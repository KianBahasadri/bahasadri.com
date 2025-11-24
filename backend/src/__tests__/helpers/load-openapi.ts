/**
 * Helper to load OpenAPI YAML files in tests
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { OpenAPIV3_1 } from "openapi-types";

type OpenAPISpecObject = OpenAPIV3_1.Document;

const FEATURES_DIR = path.resolve(
    path.join(process.cwd(), "..", "docs", "features")
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

export function loadOpenAPISpec(featureName: string): OpenAPISpecObject {
    const specPath = path.join(
        process.cwd(),
        "..",
        "docs",
        "features",
        featureName,
        "API_CONTRACT.yml"
    );
    const validatedPath = validatePathWithinDirectory(specPath, FEATURES_DIR);
    const yamlContent = readFileSync(validatedPath, "utf8");
    return parse(yamlContent) as OpenAPISpecObject;
}
