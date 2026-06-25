// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Plugin, UserConfig} from 'vite';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import stylex from '@stylexjs/unplugin';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LIBRARY_PATTERN = 'node_modules/@astryxdesign/';
const STYLEX_CSS_PATH = '/virtual:stylex.css';

/**
 * Browser targets for lightningcss (opt-in).
 * Only needed if your StyleX version lowers light-dark() without them.
 * Exported for consumers who want to opt in explicitly.
 */
export const LIGHTNINGCSS_TARGETS = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

/**
 * Legacy options shape — kept for backward compatibility.
 * Prefer the zero-config form: astryxStylex()
 */
export interface AstryxVitePluginLegacyOptions {
  stylexOptions: Parameters<typeof stylex.vite>[0];
  libraryPattern?: string;
  /** StyleX atomic class-name prefix for Astryx library styles. @default 'astryx' */
  stylexPrefix?: string;
  layers?: {
    library?: string;
    product?: string;
  };
}

export interface AstryxVitePluginOptions {
  /**
   * Whether to enable dev mode for StyleX.
   * @default process.env.NODE_ENV !== 'production'
   */
  dev?: boolean;

  /**
   * Root directory for module resolution.
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * Pattern to identify Astryx library files vs product files.
   * @default 'node_modules/@astryxdesign/'
   */
  libraryPattern?: string;

  /**
   * CSS layer names for the split output.
   */
  layers?: {
    /** Layer name for Astryx library styles @default 'astryx-base' */
    library?: string;
    /** Layer name for product styles @default 'product' */
    product?: string;
  };

  /**
   * LightningCSS browser targets. Only needed if your StyleX version
   * lowers light-dark() without them. Most recent versions preserve
   * light-dark() by default.
   * @default undefined (no targets set)
   */
  lightningcssTargets?: Record<string, number>;

  /**
   * StyleX atomic class-name prefix for Astryx *library* styles. The product
   * build uses a distinct prefix so library and product atoms never collide
   * across layers.
   *
   * Configurable to support the Astryx-prefix migration (P2380608025): a consumer
   * can rebrand the library atom prefix to `astryx` before the final cutover.
   * Defaults to `xds` so existing consumers are unaffected.
   *
   * @default 'astryx'
   */
  stylexPrefix?: string;

  /**
   * Extra StyleX options to merge.
   */
  stylexOverrides?: Record<string, unknown>;
}

/**
 * Astryx Vite plugin for source builds.
 *
 * Provides sensible defaults for StyleX compilation with Astryx.
 * Just spread into your plugins array:
 *
 *   plugins: [...astryxStylex(), react()]
 *
 * Handles:
 * - StyleX compilation with correct settings
 * - CSS layer ordering (reset < astryx-base < astryx-theme < product)
 * - resolve.alias for @astryxdesign/core source
 * - optimizeDeps.exclude to prevent Vite pre-bundling Astryx
 *
 * @param options — optional overrides
 */
export function astryxStylex(
  options: AstryxVitePluginOptions | AstryxVitePluginLegacyOptions = {},
): Plugin[] {
  // Detect legacy API: astryxStylex({stylexOptions: {...}})
  if ('stylexOptions' in options && options.stylexOptions) {
    return astryxStylexLegacy(options as AstryxVitePluginLegacyOptions);
  }

  const opts = options as AstryxVitePluginOptions;
  const {
    dev = process.env.NODE_ENV !== 'production',
    rootDir = process.cwd(),
    libraryPattern = LIBRARY_PATTERN,
    layers = {},
    lightningcssTargets,
    stylexPrefix = 'astryx',
    stylexOverrides = {},
  } = opts;

  const libraryLayer = layers.library ?? 'astryx-base';
  const productLayer = layers.product ?? 'product';

  // Build StyleX options with sensible defaults
  const stylexOptions: Record<string, unknown> = {
    dev,
    runtimeInjection: false,
    treeshakeCompensation: true,
    unstable_moduleResolution: {
      type: 'commonJS',
      rootDir,
    },
    ...(lightningcssTargets && {
      lightningcssOptions: {targets: lightningcssTargets},
    }),
    ...stylexOverrides,
  };

  // Inject our babel wrapper as a user plugin — it runs before the
  // unplugin's hardcoded StyleX instance and handles prefix routing.
  const astryxBabelPlugin = path.resolve(__dirname, 'babel.js');

  const basePlugin = stylex.vite({
    ...(stylexOptions as any),
    useCSSLayers: true,
    babelConfig: {
      plugins: [
        [
          astryxBabelPlugin,
          {
            ...stylexOptions,
            libraryPrefix: stylexPrefix,
            babelConfig: undefined,
          },
        ],
      ],
    },
  });

  // Layer order declaration plugin
  const layerOrderPlugin: Plugin = {
    name: 'astryx-css-layer-order',
    transformIndexHtml() {
      return [
        {
          tag: 'style',
          children: `@layer reset, ${libraryLayer}, astryx-theme, ${productLayer};`,
          injectTo: 'head-prepend',
        },
      ];
    },
  };

  // Config plugin — injects resolve.alias and optimizeDeps
  const configPlugin: Plugin = {
    name: 'astryx-config',
    config(): UserConfig {
      // Discover all @astryxdesign/* packages to exclude from pre-bundling.
      // Astryx ships as source that must be compiled by StyleX — pre-bundling
      // strips stylex.create/defineVars calls and causes runtime errors.
      let xdsPackages: string[] = ['@astryxdesign/core'];
      try {
        const fs = require('fs');
        const xdsDir = path.resolve(rootDir, 'node_modules/@astryxdesign');
        if (fs.existsSync(xdsDir)) {
          xdsPackages = fs
            .readdirSync(xdsDir)
            .filter((name: string) => !name.startsWith('.'))
            .map((name: string) => `@astryxdesign/${name}`);
        }
      } catch {
        // Fallback to just @astryxdesign/core if discovery fails
      }

      return {
        resolve: {
          alias: {
            '@astryxdesign/core/theme/tokens.stylex': path.resolve(
              rootDir,
              'node_modules/@astryxdesign/core/src/theme/tokens.stylex.ts',
            ),
            '@astryxdesign/core': path.resolve(rootDir, 'node_modules/@astryxdesign/core/src'),
          },
        },
        optimizeDeps: {
          exclude: xdsPackages,
        },
      };
    },
  };

  // Split-layer interceptor plugin (dev server only)
  const splitLayerPlugin: Plugin = {
    name: 'astryx-split-layers',
    configureServer(server) {
      let stylexPlugin: any = null;

      return () => {
        for (const p of server.config.plugins.flat()) {
          if ((p as any)?.__stylexGetSharedStore) {
            stylexPlugin = p;
            break;
          }
        }

        server.middlewares.stack.unshift({
          route: '',
          handle: (req: any, res: any, next: any) => {
            if (!req.url?.startsWith(STYLEX_CSS_PATH)) {
              return next();
            }

            if (!stylexPlugin) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/css');
              res.end('');
              return;
            }

            const shared = stylexPlugin.__stylexGetSharedStore?.();
            const rulesById = shared?.rulesById;

            if (!rulesById || rulesById.size === 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/css');
              res.end('');
              return;
            }

            const libraryRules: any[] = [];
            const productRules: any[] = [];

            for (const [filePath, rules] of rulesById.entries()) {
              if (filePath.includes(libraryPattern)) {
                libraryRules.push(...rules);
              } else {
                productRules.push(...rules);
              }
            }

            const libraryCss = libraryRules.length
              ? stylexBabelPlugin.processStylexRules(libraryRules, {
                  useLayers: true,
                })
              : '';
            const productCss = productRules.length
              ? stylexBabelPlugin.processStylexRules(productRules, {
                  useLayers: true,
                })
              : '';

            const parts: string[] = [];
            if (libraryCss)
              parts.push(`@layer ${libraryLayer} {\n${libraryCss}\n}`);
            if (productCss)
              parts.push(`@layer ${productLayer} {\n${productCss}\n}`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-store');
            res.end(parts.join('\n\n'));
          },
        });
      };
    },
  };

  return [configPlugin, layerOrderPlugin, basePlugin, splitLayerPlugin];
}

/**
 * Legacy implementation — handles the old astryxStylex({stylexOptions: {...}}) API.
 * Used by Storybook and other existing configs.
 */
function astryxStylexLegacy(options: AstryxVitePluginLegacyOptions): Plugin[] {
  const {
    stylexOptions,
    libraryPattern = LIBRARY_PATTERN,
    stylexPrefix = 'astryx',
    layers = {},
  } = options;

  const libraryLayer = layers.library ?? 'astryx-base';
  const productLayer = layers.product ?? 'product';

  const astryxBabelPlugin = path.resolve(__dirname, 'babel.js');
  const existingPlugins = (stylexOptions as any).babelConfig?.plugins ?? [];

  const basePlugin = stylex.vite({
    ...(stylexOptions as any),
    useCSSLayers: true,
    babelConfig: {
      ...(stylexOptions as any).babelConfig,
      plugins: [
        [
          astryxBabelPlugin,
          {
            ...(stylexOptions as any),
            libraryPrefix: stylexPrefix,
            babelConfig: undefined,
          },
        ],
        ...existingPlugins,
      ],
    },
  });

  const layerOrderPlugin: Plugin = {
    name: 'astryx-css-layer-order',
    transformIndexHtml() {
      return [
        {
          tag: 'style',
          children: `@layer reset, ${libraryLayer}, astryx-theme, ${productLayer};`,
          injectTo: 'head-prepend',
        },
      ];
    },
  };

  const splitLayerPlugin: Plugin = {
    name: 'astryx-split-layers',
    configureServer(server) {
      let stylexPlugin: any = null;

      return () => {
        for (const p of server.config.plugins.flat()) {
          if ((p as any)?.__stylexGetSharedStore) {
            stylexPlugin = p;
            break;
          }
        }

        server.middlewares.stack.unshift({
          route: '',
          handle: (req: any, res: any, next: any) => {
            if (!req.url?.startsWith(STYLEX_CSS_PATH)) {
              return next();
            }

            if (!stylexPlugin) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/css');
              res.end('');
              return;
            }

            const shared = stylexPlugin.__stylexGetSharedStore?.();
            const rulesById = shared?.rulesById;

            if (!rulesById || rulesById.size === 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/css');
              res.end('');
              return;
            }

            const libraryRules: any[] = [];
            const productRules: any[] = [];

            for (const [filePath, rules] of rulesById.entries()) {
              if (filePath.includes(libraryPattern)) {
                libraryRules.push(...rules);
              } else {
                productRules.push(...rules);
              }
            }

            const libraryCss = libraryRules.length
              ? stylexBabelPlugin.processStylexRules(libraryRules, {
                  useLayers: true,
                })
              : '';
            const productCss = productRules.length
              ? stylexBabelPlugin.processStylexRules(productRules, {
                  useLayers: true,
                })
              : '';

            const parts: string[] = [];
            if (libraryCss)
              parts.push(`@layer ${libraryLayer} {\n${libraryCss}\n}`);
            if (productCss)
              parts.push(`@layer ${productLayer} {\n${productCss}\n}`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-store');
            res.end(parts.join('\n\n'));
          },
        });
      };
    },
  };

  return [layerOrderPlugin, basePlugin, splitLayerPlugin];
}
