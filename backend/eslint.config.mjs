import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";

export default [
    {
        ignores: ["dist", "node_modules", "public", ".wrangler", "coverage"],
    },

    // 1. Base JS Recommendations
    js.configs.recommended,

    // 3. Unicorn
    unicorn.configs["recommended"],

    // 4. SonarJS
    sonarjs.configs.recommended,

    // 5. Security
    security.configs.recommended,

    // 2. TypeScript "God Mode" - only for TypeScript files
    ...tseslint.configs.strictTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),

    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // --- 11/10 STRICT RULES ---
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "no-console": ["error", { allow: ["warn", "error"] }],

            // Unicorn Overrides
            "unicorn/filename-case": [
                "error",
                { cases: { kebabCase: true, pascalCase: true } },
            ],
            "unicorn/prevent-abbreviations": "off", // Turn this off if "props" -> "properties" annoys you

            // SonarJS Overrides
            "sonarjs/cognitive-complexity": ["error", 15], // Slightly higher limit for backend

            // TypeScript Overrides
            "@typescript-eslint/no-unsafe-assignment": "warn", // Downgrade to warning for external APIs
            "@typescript-eslint/no-unsafe-member-access": "warn", // Downgrade to warning for external APIs

            // Security Overrides
            "security/detect-object-injection": "warn", // Downgrade to warning (false positives for Record<string, T>)
        },
    },
];
