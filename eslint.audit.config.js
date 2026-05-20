// Temporary config to audit all disabled @eslint-react rules
import eslintReact from "@eslint-react/eslint-plugin";

// Rules that are already enabled in the main config
const alreadyEnabled = new Set([
  '@eslint-react/no-nested-component-definitions',
  '@eslint-react/no-unstable-default-props',
  '@eslint-react/no-unstable-context-value',
  '@eslint-react/set-state-in-render',
  '@eslint-react/dom-no-missing-button-type',
  '@eslint-react/dom-no-void-elements-with-children',
  '@eslint-react/no-missing-key',
  '@eslint-react/jsx-no-comment-textnodes',
  '@eslint-react/jsx-no-leaked-dollar',
  '@eslint-react/web-api-no-leaked-event-listener',
  '@eslint-react/web-api-no-leaked-interval',
  '@eslint-react/web-api-no-leaked-timeout',
  '@eslint-react/web-api-no-leaked-resize-observer',
]);

// Get all rules from the 'all' config, keep only disabled ones
const allRules = eslintReact.configs.all.rules || {};
const disabledRules = {};
for (const [rule, severity] of Object.entries(allRules)) {
  if (!alreadyEnabled.has(rule)) {
    disabledRules[rule] = 'warn';
  }
}

export default [
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test-violations.tsx"],
    languageOptions: {
      parser: (await import("typescript-eslint")).default.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: eslintReact.configs.recommended.plugins,
    rules: disabledRules,
  },
];
