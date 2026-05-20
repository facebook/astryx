// Copyright (c) Meta Platforms, Inc. and affiliates.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
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
 *   pnpm lint                    # Human mode (warnings)
 *   XDS_STRICT_LINT=1 pnpm lint  # Strict mode (errors)
 *   CI=true pnpm lint            # Also triggers strict mode
 */

const isStrictMode = process.env.XDS_STRICT_LINT === '1' || process.env.CI === 'true';
const xdsConfig = isStrictMode ? xdsPlugin.configs.strict : xdsPlugin.configs.recommended;
const reactSeverity = isStrictMode ? 'error' : 'warn';

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
      "**/next-env.d.ts",
      "**/.next/**",
      "apps/example-nextjs-source/*.js",
      "apps/docsite/*.js",
      "apps/docsite/scripts/**",
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
  // Copyright header — all source files must have the Meta copyright notice
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      '@xds': xdsPlugin,
    },
    rules: {
      '@xds/copyright-header': 'error',
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
  // React bug-prevention rules - applies to core package
  // Uses @eslint-react for bugs that TypeScript alone cannot catch.
  // Children.*/cloneElement are already covered by @xds/no-react-introspection.
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    plugins: eslintReact.configs.recommended.plugins,
    rules: {
      // React fundamentals
      '@eslint-react/rules-of-hooks': reactSeverity,
      '@eslint-react/purity': reactSeverity,

      // Component structure bugs
      '@eslint-react/no-nested-component-definitions': reactSeverity,
      '@eslint-react/no-unstable-default-props': reactSeverity,
      '@eslint-react/no-unstable-context-value': reactSeverity,
      '@eslint-react/set-state-in-render': reactSeverity,

      // DOM correctness
      '@eslint-react/dom-no-missing-button-type': reactSeverity,
      '@eslint-react/dom-no-void-elements-with-children': reactSeverity,

      // JSX correctness
      '@eslint-react/no-missing-key': reactSeverity,
      '@eslint-react/jsx-no-comment-textnodes': reactSeverity,
      '@eslint-react/jsx-no-leaked-dollar': reactSeverity,

      // Resource leak prevention
      '@eslint-react/web-api-no-leaked-event-listener': reactSeverity,
      '@eslint-react/web-api-no-leaked-interval': reactSeverity,
      '@eslint-react/web-api-no-leaked-timeout': reactSeverity,
      '@eslint-react/web-api-no-leaked-resize-observer': reactSeverity,
    },
  },
);
