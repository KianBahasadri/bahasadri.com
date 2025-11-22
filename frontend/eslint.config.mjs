import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
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
        files: ["**/*.{ts,tsx}"],
    })),
    ...tseslint.configs.stylisticTypeChecked.map((config) => ({
        ...config,
        files: ["**/*.{ts,tsx}"],
    })),

    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: { version: "detect" },
        },
        rules: {
            // React & Hooks
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,

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
            "unicorn/no-useless-undefined": "off", // Allow undefined for clarity in conditionals

            // SonarJS Overrides
            "sonarjs/cognitive-complexity": ["error", 10],

            // React Specifics
            "react/jsx-no-leaked-render": "error",
            "react/hook-use-state": "error",
        },
    },
];
