// Copyright (c) Meta Platforms, Inc. and affiliates.

import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import reactCompiler from "eslint-plugin-react-compiler";
import astryxPlugin from "./internal/eslint-plugin-astryx/index.js";

/* global process */

/**
 * Astryx ESLint Configuration
 *
 * Two-tier linting philosophy:
 * - CI/Agents: Strict mode (errors) - Set ASTRYX_STRICT_LINT=1 or CI=true
 * - Humans: Recommended mode (warnings) - Default for local development
 *
 * Usage:
 *   pnpm lint                    # Human mode (warnings)
 *   ASTRYX_STRICT_LINT=1 pnpm lint  # Strict mode (errors)
 *   CI=true pnpm lint            # Also triggers strict mode
 */

const isStrictMode = process.env.ASTRYX_STRICT_LINT === '1' || process.env.CI === 'true';
const astryxConfig = isStrictMode ? astryxPlugin.configs.strict : astryxPlugin.configs.recommended;
const reactSeverity = isStrictMode ? 'error' : 'warn';

// The internal plugin is plain untyped JS (kept out of the lint/type surface),
// so its inferred shape doesn't satisfy ESLint's strict `Plugin` type. One
// localized assertion here keeps every `plugins` entry below type-checked.
const astryxEslintPlugin = /** @type {import('eslint').ESLint.Plugin} */ (
  /** @type {unknown} */ (astryxPlugin)
);

// typescript-eslint ≥8.62 types its presets with loose cross-version
// "compatibility" shapes (`CompatibleConfig` = `{name?, rules?: object}`);
// normalize back to ESLint's own config type for `defineConfig`.
const tseslintRecommended = /** @type {import('eslint').Linter.Config[]} */ (
  tseslint.configs.recommended
);

export default defineConfig(
  js.configs.recommended,
  tseslintRecommended,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      ".claude/**",
      "**/internal/eslint-plugin-astryx/**",
      ".github/scripts/**",
      "scripts/**",
      // Changesets tooling (custom changelog module + config) is CommonJS
      // build/release glue, not shipped source — keep it out of the TS/ESM
      // lint pass (consistent with scripts/** above).
      ".changeset/**",
      // .mjs is ignored everywhere EXCEPT the CLI package, whose runtime is
      // entirely .mjs. The negations below opt packages/cli back into linting
      // (see the dedicated CLI block lower down). Scoped to packages/cli on
      // purpose — other packages' .mjs stay unlinted (#2468).
      "**/*.mjs",
      "!packages/cli/src/**/*.mjs",
      "!packages/cli/bin/**/*.mjs",
      "**/*.test-violations.tsx",
      "apps/example-nextjs/*.js",
      "**/next-env.d.ts",
      "**/.next/**",
      "apps/example-nextjs-source/*.js",
      "apps/docsite/*.js",
      "apps/docsite/scripts/**",
      "apps/sandbox/*.js",
      "apps/sandbox/out/**",
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
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "curly": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-assertions": ["warn", {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "never",
      }],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {fixStyle: "inline-type-imports"},
      ],
    },
  },
  // Type-aware linting for core. Keep this scoped: projectService has a
  // measurable startup cost, but catches async correctness issues syntax-only
  // lint cannot see.
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/array-type": [
        reactSeverity,
        {default: "array", readonly: "generic"},
      ],
      "@typescript-eslint/await-thenable": reactSeverity,
      "@typescript-eslint/no-array-delete": reactSeverity,
      "@typescript-eslint/no-base-to-string": reactSeverity,
      "@typescript-eslint/no-duplicate-type-constituents": reactSeverity,
      "@typescript-eslint/no-dynamic-delete": reactSeverity,
      "@typescript-eslint/no-floating-promises": reactSeverity,
      "@typescript-eslint/no-for-in-array": reactSeverity,
      "@typescript-eslint/no-implied-eval": reactSeverity,
      "@typescript-eslint/no-import-type-side-effects": reactSeverity,
      "@typescript-eslint/no-invalid-void-type": reactSeverity,
      "@typescript-eslint/no-misused-promises": reactSeverity,
      "@typescript-eslint/no-unnecessary-type-conversion": reactSeverity,
      "@typescript-eslint/no-unnecessary-type-assertion": reactSeverity,
      "@typescript-eslint/no-useless-default-assignment": reactSeverity,
      "@typescript-eslint/no-redeclare": reactSeverity,
      "@typescript-eslint/only-throw-error": reactSeverity,
      "@typescript-eslint/prefer-includes": reactSeverity,
      "@typescript-eslint/prefer-string-starts-ends-with": reactSeverity,
      "@typescript-eslint/promise-function-async": [
        reactSeverity,
        {allowAny: false},
      ],
      "@typescript-eslint/require-array-sort-compare": reactSeverity,
      "@typescript-eslint/restrict-plus-operands": reactSeverity,
      "@typescript-eslint/restrict-template-expressions": reactSeverity,
      "@typescript-eslint/return-await": reactSeverity,
      "@typescript-eslint/switch-exhaustiveness-check": reactSeverity,
    },
  },
  // Copyright header — all source files must have the Meta copyright notice
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/*.d.ts", "**/dist/**"],
    plugins: {
      '@astryx': astryxEslintPlugin,
    },
    rules: {
      '@astryx/copyright-header': 'error',
    },
  },
  // Astryx design token enforcement - applies to core package (excluding theme files)
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    ignores: ["packages/core/src/theme/**"],
    ...astryxConfig,
    rules: {
      ...astryxConfig.rules,
      // Temporarily allow Children.* in files that need architectural fixes.
      // Tracked: OverflowList, MetadataList, Carousel need data-driven APIs.
      '@astryx/no-react-introspection': ['error', {
        allowFiles: [
          'OverflowList/OverflowList',
          'MetadataList/MetadataList',
          'Carousel/Carousel',
        ],
      }],
    },
  },
  // The i18n runtime itself defines the message strings the rest of the
  // package resolves against; a "hardcoded string" check against it would be
  // circular. Turn off @astryx/no-hardcoded-i18n-string just for this dir.
  {
    files: ["packages/core/src/i18n/**/*.{ts,tsx}"],
    rules: {
      '@astryx/no-hardcoded-i18n-string': 'off',
    },
  },
  // React bug-prevention rules - applies to core package
  // Uses @eslint-react for bugs that TypeScript alone cannot catch.
  // Children.*/cloneElement are already covered by @astryx/no-react-introspection.
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    plugins: {
      ...eslintReact.configs.recommended.plugins,
      'react-compiler': reactCompiler,
    },
    rules: {
      // React Compiler compatibility
      'react-compiler/react-compiler': reactSeverity,
      // React fundamentals
      '@eslint-react/rules-of-hooks': reactSeverity,
      '@eslint-react/purity': reactSeverity,
      '@eslint-react/unsupported-syntax': reactSeverity,
      '@eslint-react/exhaustive-deps': reactSeverity,

      // Component structure bugs
      '@eslint-react/no-nested-component-definitions': reactSeverity,
      '@eslint-react/no-nested-lazy-component-declarations': reactSeverity,
      '@eslint-react/no-unstable-default-props': reactSeverity,
      '@eslint-react/no-unstable-context-value': reactSeverity,
      '@eslint-react/set-state-in-effect': reactSeverity,
      '@eslint-react/set-state-in-render': reactSeverity,
      '@eslint-react/no-missing-component-display-name': reactSeverity,

      // Hooks
      '@eslint-react/use-memo': reactSeverity,
      '@eslint-react/no-unnecessary-use-prefix': reactSeverity,
      '@eslint-react/no-create-ref': reactSeverity,
      '@eslint-react/no-forward-ref': reactSeverity,
      '@eslint-react/no-unused-state': reactSeverity,

      // DOM correctness
      '@eslint-react/dom-no-missing-button-type': reactSeverity,
      '@eslint-react/dom-no-missing-iframe-sandbox': reactSeverity,
      '@eslint-react/dom-no-void-elements-with-children': reactSeverity,
      '@eslint-react/dom-no-dangerously-set-innerhtml': reactSeverity,
      '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': reactSeverity,
      '@eslint-react/dom-no-find-dom-node': reactSeverity,
      '@eslint-react/dom-no-flush-sync': reactSeverity,
      '@eslint-react/dom-no-script-url': reactSeverity,
      '@eslint-react/dom-no-string-style-prop': reactSeverity,
      '@eslint-react/dom-no-unsafe-target-blank': reactSeverity,
      '@eslint-react/dom-no-unknown-property': reactSeverity,

      // JSX correctness
      '@eslint-react/no-missing-key': reactSeverity,
      '@eslint-react/no-array-index-key': reactSeverity,
      '@eslint-react/jsx-no-comment-textnodes': reactSeverity,
      '@eslint-react/jsx-no-leaked-dollar': reactSeverity,
      '@eslint-react/jsx-no-children-prop': reactSeverity,
      '@eslint-react/jsx-no-children-prop-with-children': reactSeverity,
      '@eslint-react/jsx-no-key-after-spread': reactSeverity,
      '@eslint-react/jsx-no-leaked-semicolon': reactSeverity,
      '@eslint-react/jsx-no-useless-fragment': reactSeverity,

      // Naming conventions
      '@eslint-react/naming-convention-context-name': reactSeverity,
      '@eslint-react/naming-convention-ref-name': reactSeverity,

      // React 19 modernization
      '@eslint-react/no-context-provider': reactSeverity,
      '@eslint-react/no-use-context': reactSeverity,
      '@eslint-react/no-missing-context-display-name': reactSeverity,

      // Resource leak prevention
      '@eslint-react/web-api-no-leaked-event-listener': reactSeverity,
      '@eslint-react/web-api-no-leaked-interval': reactSeverity,
      '@eslint-react/web-api-no-leaked-timeout': reactSeverity,
      '@eslint-react/web-api-no-leaked-resize-observer': reactSeverity,
      '@eslint-react/web-api-no-leaked-fetch': reactSeverity,
    },
  },
  // App preview surfaces may embed local pages, but every iframe must be sandboxed.
  {
    files: ["apps/docsite/**/*.{ts,tsx}", "apps/sandbox/**/*.{ts,tsx}"],
    plugins: {
      ...eslintReact.configs.recommended.plugins,
    },
    rules: {
      '@eslint-react/dom-no-missing-iframe-sandbox': reactSeverity,
    },
  },
  // Browser documentation/demo surfaces should avoid unsafe new-tab links.
  {
    files: [
      "apps/docsite/**/*.{ts,tsx}",
      "apps/sandbox/**/*.{ts,tsx}",
      "apps/storybook/**/*.{ts,tsx}",
    ],
    plugins: {
      ...eslintReact.configs.recommended.plugins,
    },
    rules: {
      '@eslint-react/dom-no-unsafe-target-blank': reactSeverity,
    },
  },
  // Test files — relax rules for test ergonomics (must be after React rules
  // block so it overrides react-compiler/react-compiler)
  {
    files: ["**/*.test.{ts,tsx}", "**/*.perf.test.{ts,tsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "react-compiler/react-compiler": "off",
    },
  },
  // Non-production code — allow console.log for demos, tools, and examples
  {
    files: [
      "apps/storybook/stories/**/*.{ts,tsx}",
      "apps/docsite/src/generated/**/*.{ts,tsx}",
      "apps/sandbox/**/*.{ts,tsx}",
      "apps/example-*/**/*.{ts,tsx}",
      "internal/**/*.{ts,tsx}",
      "packages/cli/templates/**/*.{ts,tsx}",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // CLI runtime (.mjs). The CLI ships as ESM Node modules and was never linted
  // (the global **/*.mjs ignore swallowed it; see #2468). This block gives the
  // .mjs sources a Node language environment and enforces the JSON-stdout
  // contract (#2467) at author time via @astryx/no-raw-console-cli.
  {
    files: ["packages/cli/src/**/*.mjs", "packages/cli/bin/**/*.mjs"],
    plugins: {
      '@astryx': astryxEslintPlugin,
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        // Node globals (no `globals` package dependency in this repo).
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        queueMicrotask: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        globalThis: "readonly",
        structuredClone: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      // Bare console.log corrupts --json stdout. Route human chatter through
      // humanLog(); console.error/console.warn (stderr) stay allowed.
      "@astryx/no-raw-console-cli": "error",
    },
  },
  // Copyright header for CLI .mjs sources (the main copyright block only
  // covers .ts/.tsx).
  {
    files: ["packages/cli/src/**/*.mjs", "packages/cli/bin/**/*.mjs"],
    plugins: {
      '@astryx': astryxEslintPlugin,
    },
    rules: {
      '@astryx/copyright-header': 'error',
    },
  },
  // CLI tests — relax author-ergonomics rules (test files emit freely and may
  // keep intentionally-unused fixtures). Must come after the CLI block above.
  {
    files: ["packages/cli/**/*.test.mjs"],
    rules: {
      "@astryx/no-raw-console-cli": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
