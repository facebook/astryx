import js from "@eslint/js";
import tseslint from "typescript-eslint";
import xdsPlugin from "./internal/eslint-plugin-xds/index.js";

/* global process */

/**
 * XDS ESLint Configuration
 *
 * Two-tier linting philosophy:
 * - CI/Agents: Strict mode (errors) - Set XDS_STRICT_LINT=1 or CI=true
 * - Humans: Recommended mode (warnings) - Default for local development
 *
 * Usage:
 *   yarn lint                    # Human mode (warnings)
 *   XDS_STRICT_LINT=1 yarn lint  # Strict mode (errors)
 *   CI=true yarn lint            # Also triggers strict mode
 */

const isStrictMode = process.env.XDS_STRICT_LINT === '1' || process.env.CI === 'true';
const xdsConfig = isStrictMode ? xdsPlugin.configs.strict : xdsPlugin.configs.recommended;

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/internal/eslint-plugin-xds/**",
      ".github/scripts/**",
      "scripts/**",
      "**/*.mjs",
      "**/*.test-violations.tsx",
      "apps/example-nextjs/*.js",
      "apps/example-nextjs/next-env.d.ts",
      "apps/example-nextjs-source/*.js",
      "apps/sandbox/*.js",
      "packages/build/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
  // XDS design token enforcement - applies to core package (excluding theme files)
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    ignores: ["packages/core/src/theme/**"],
    ...xdsConfig,
    rules: {
      ...xdsConfig.rules,
      // Temporarily allow Children.* in files that need architectural fixes.
      // Tracked: OverflowList, MetadataList, Carousel need data-driven APIs.
      '@xds/no-react-introspection': ['error', {
        allowFiles: [
          'OverflowList/XDSOverflowList',
          'MetadataList/XDSMetadataList',
          'Carousel/XDSCarousel',
        ],
      }],
    },
  },
);
