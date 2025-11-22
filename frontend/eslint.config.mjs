import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";

export default [
    {
        ignores: ["dist", "node_modules", "public", ".wrangler", "coverage"],
    },

    js.configs.recommended,
    unicorn.configs["recommended"],
    sonarjs.configs.recommended,
    security.configs.recommended,
    promisePlugin.configs["flat/recommended"],
    importPlugin.flatConfigs.recommended,
    jsxA11y.flatConfigs.recommended, // Accessibility rules

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
            // React Core
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,

            // --- YOUR EXISTING STRICT RULES ---
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "no-console": ["error", { allow: ["warn", "error"] }],

            // --- HIGH-VALUE ADDITIONS ---

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

            // --- REACT-SPECIFIC STRICT RULES ---

            // React Best Practices
            "react/jsx-no-leaked-render": "error",
            "react/hook-use-state": "error",
            "react/jsx-no-useless-fragment": "error",
            "react/jsx-boolean-value": ["error", "never"],
            "react/self-closing-comp": "error",
            "react/jsx-curly-brace-presence": [
                "error",
                { props: "never", children: "never" },
            ],
            "react/no-array-index-key": "error",
            "react/jsx-key": ["error", { checkFragmentShorthand: true }],

            // React Hooks Strictness
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",

            // --- OVERRIDES ---

            // Unicorn
            "unicorn/filename-case": [
                "error",
                {
                    cases: { kebabCase: true, pascalCase: true },
                },
            ],
            "unicorn/prevent-abbreviations": "off",
            "unicorn/no-useless-undefined": "off",
            "unicorn/no-null": "off", // React uses null for components

            // SonarJS
            "sonarjs/cognitive-complexity": ["error", 10],

            // Disable problematic rules
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "security/detect-object-injection": "off",

            // React specific - sometimes you need props spreading
            "react/jsx-props-no-spreading": "off",
        },
    },
];
