module.exports = {
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Custom rules can be added here to match our standards (e.g., no 'any')
    '@typescript-eslint/no-explicit-any': 'error',
    'react/no-unescaped-entities': 'off', // If needed for compatibility
  },
};

