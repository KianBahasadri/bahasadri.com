/**
 * Helper to load OpenAPI YAML files in tests
 */

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

export function loadOpenAPISpec(featureName: string): unknown {
    const specPath = join(
        process.cwd(),
        "..",
        "docs",
        "features",
        featureName,
        "API_CONTRACT.yml"
    );
    const yamlContent = readFileSync(specPath, "utf-8");
    return parse(yamlContent);
}

