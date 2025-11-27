import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
    {
        ignores: [
            "dist",
            "node_modules",
            "public",
            ".wrangler",
            "coverage",
            "eslint.config.mjs",
            "vitest.config.ts",
        ],
    },

    js.configs.recommended,
    unicorn.configs["recommended"],
    sonarjs.configs.recommended,
    security.configs.recommended,
    promisePlugin.configs["flat/recommended"],
    importPlugin.flatConfigs.recommended,

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
                tsconfigRootDir: __dirname,
            },
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
            },
        },
        rules: {
            // Core Strict Rules
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "no-console": ["error", { allow: ["warn", "error"] }],

            // Async/Promise Safety
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/promise-function-async": "error",

            // Null/Undefined Safety
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",

            // Type Consistency
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],
            "@typescript-eslint/consistent-type-exports": "error",

            // Import Organization
            "import/no-cycle": "error",
            "import/no-self-import": "error",
            "import/no-duplicates": "error",
            "import/first": "error",

            // Common Mistakes
            "no-param-reassign": ["error", { props: false }],
            eqeqeq: ["error", "always"],
            "require-await": "error",

            // Overrides for preset rules (KEEP these "off" statements)
            "unicorn/prevent-abbreviations": "off", // Unicorn enables this by default
            "unicorn/filename-case": [
                "error",
                {
                    cases: { kebabCase: true, pascalCase: true },
                },
            ],
            "sonarjs/cognitive-complexity": ["error", 15],

            // Disable problematic strict rules from preset configs
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "security/detect-object-injection": "off",
        },
    },
    {
        // Scripts need to use promise chains due to tsx CJS limitation
        files: ["scripts/**/*.ts"],
        rules: {
            "unicorn/prefer-top-level-await": "off",
            "security/detect-non-literal-fs-filename": "off",
        },
    },
    {
        // Test files have different requirements
        files: ["src/__tests__/**/*.ts"],
        rules: {
            "unicorn/no-useless-undefined": "off",
            "sonarjs/no-hardcoded-passwords": "off",
            "security/detect-non-literal-fs-filename": "off",
        },
    },
    {
        // Container JavaScript files run in Node.js environment
        files: ["containers/**/*.js"],
        languageOptions: {
            globals: {
                process: "readonly",
                console: "readonly",
                Buffer: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-console": "off",
            "unicorn/no-process-exit": "off",
            "unicorn/prefer-node-protocol": "error",
            "unicorn/import-style": "off",
            "unicorn/prevent-abbreviations": "off",
            "unicorn/catch-error-name": "off",
            "unicorn/prefer-number-properties": "error",
            "unicorn/text-encoding-identifier-case": "error",
            "unicorn/no-null": "off",
            "unicorn/numeric-separators-style": "error",
            "unicorn/prefer-top-level-await": "off",
            "unicorn/prefer-string-replace-all": "error",
            "unicorn/no-array-sort": "off",
            "sonarjs/no-os-command-from-path": "off",
            "sonarjs/cognitive-complexity": ["error", 20],
            "security/detect-non-literal-fs-filename": "off",
            "security/detect-object-injection": "off",
            "promise/always-return": "off",
            "promise/no-nesting": "off",
            "import/no-unresolved": "off",
        },
    },
];
