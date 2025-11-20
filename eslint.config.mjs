/**
 * ESLint flat config for Bahasadri.com.
 *
 * Aligns the project with ESLint v9's flat config requirements while reusing
 * Next.js Core Web Vitals rules via `eslint-config-next`. The ignore block
 * prevents lint runs from traversing generated artifacts (e.g., `.next`,
 * `.open-next`) so analysis stays focused on source files.
 *
 * @see ./docs/AI_AGENT_STANDARDS.md - Mandatory quality requirements
 * @see ./docs/DEVELOPMENT.md - Development workflow and tooling
 */

import next from "eslint-config-next";

const eslintConfig = [
    {
        ignores: [
            "**/node_modules/**",
            ".next/**",
            ".open-next/**",
            ".turbo/**",
            ".wrangler/**",
            "dist/**",
        ],
    },
    ...next,
    {
        rules: {
            "react/no-unescaped-entities": "off",
        },
    },
];

export default eslintConfig;

