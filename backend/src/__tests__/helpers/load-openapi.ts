/**
 * Helper to load OpenAPI YAML files in tests
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { OpenAPIV3_1 } from "openapi-types";

type OpenAPISpecObject = OpenAPIV3_1.Document;

export function loadOpenAPISpec(featureName: string): OpenAPISpecObject {
    const specPath = path.join(
        process.cwd(),
        "..",
        "docs",
        "features",
        featureName,
        "API_CONTRACT.yml"
    );
    const yamlContent = readFileSync(specPath, "utf8");
    return parse(yamlContent) as OpenAPISpecObject;
}
