// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Plugin, UserConfig} from 'vite';
import stylex from '@stylexjs/unplugin';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {splitStylexLayers} from './splitLayers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STYLEX_CSS_PATH = '/virtual:stylex.css';

function toPatterns(pattern: string | string[] | undefined): string[] {
  if (pattern == null) return [];
  return Array.isArray(pattern) ? pattern : [pattern];
}

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
  /** Extra path fragments that mark a file as Astryx library source. */
  libraryPattern?: string | string[];
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
   * Extra path fragments that mark a file as Astryx library source, on top of
   * the built-in ones (`node_modules/@astryxdesign/`, `packages/core/`,
   * `packages/themes/`, `packages/lab/`). Library source is compiled with the
   * library class-name prefix, which is what puts it in the library layer.
   */
  libraryPattern?: string | string[];

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
   * Configurable if a consumer needs a custom library atom prefix.
   * Defaults to `astryx`.
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
 * Declares the layer order the split output relies on. The theme layer name
 * is fixed: a theme package ships CSS written into `astryx-theme`.
 */
function createLayerOrderPlugin(
  libraryLayer: string,
  productLayer: string,
): Plugin {
  return {
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
}

/**
 * Re-nests StyleX's flat priority layers into the library and product layers.
 *
 * StyleX hands us its CSS in three different places, so all three are covered:
 * the dev server serves it from a middleware, and a build either injects it
 * into a bundle asset (`generateBundle`) or appends it to the written file
 * (`writeBundle`) depending on whether a CSS asset existed in time. The split
 * is idempotent, so a path that runs twice is harmless.
 */
function createSplitLayerPlugin(
  libraryLayer: string,
  productLayer: string,
  libraryPrefix: string,
): Plugin {
  const split = (css: string) =>
    splitStylexLayers(css, {libraryLayer, productLayer, libraryPrefix});

  return {
    name: 'astryx-split-layers',

    configureServer(server) {
      let stylexPlugin: any = null;

      return () => {
        for (const p of server.config.plugins.flat()) {
          if ((p as any)?.__stylexCollectCss) {
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-store');
            res.end(split(stylexPlugin?.__stylexCollectCss?.() ?? ''));
          },
        });
      };
    },

    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.css'))
          continue;
        const source =
          typeof asset.source === 'string'
            ? asset.source
            : Buffer.from(asset.source).toString('utf8');
        asset.source = split(source);
      }
    },

    writeBundle(options, bundle) {
      const outDir =
        options.dir ?? (options.file ? path.dirname(options.file) : null);
      if (outDir == null) return;

      const files = Object.values(bundle)
        .filter(
          output => output.type === 'asset' && output.fileName.endsWith('.css'),
        )
        .map(output => path.join(outDir, output.fileName));
      // StyleX falls back to its own file when the bundle held no CSS asset.
      files.push(path.join(outDir, 'assets/stylex.css'));

      for (const file of files) {
        let current: string;
        try {
          current = fs.readFileSync(file, 'utf8');
        } catch {
          continue;
        }
        const next = split(current);
        if (next !== current) fs.writeFileSync(file, next, 'utf8');
      }
    },
  };
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
    libraryPattern,
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
            extraLibraryPatterns: toPatterns(libraryPattern),
            babelConfig: undefined,
          },
        ],
      ],
    },
  });

  // Layer order declaration plugin
  const layerOrderPlugin = createLayerOrderPlugin(libraryLayer, productLayer);

  // Config plugin — injects resolve.alias and optimizeDeps
  const configPlugin: Plugin = {
    name: 'astryx-config',
    config(): UserConfig {
      // Discover all @astryxdesign/* packages to exclude from pre-bundling.
      // Astryx ships as source that must be compiled by StyleX — pre-bundling
      // strips stylex.create/defineVars calls and causes runtime errors.
      let xdsPackages: string[] = ['@astryxdesign/core'];
      try {
        const xdsDir = path.resolve(rootDir, 'node_modules/@astryxdesign');
        if (fs.existsSync(xdsDir)) {
          xdsPackages = fs
            .readdirSync(xdsDir)
            .filter(name => !name.startsWith('.'))
            .map(name => `@astryxdesign/${name}`);
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
            '@astryxdesign/core': path.resolve(
              rootDir,
              'node_modules/@astryxdesign/core/src',
            ),
          },
        },
        optimizeDeps: {
          exclude: xdsPackages,
        },
      };
    },
  };

  const splitLayerPlugin = createSplitLayerPlugin(
    libraryLayer,
    productLayer,
    stylexPrefix,
  );

  return [configPlugin, layerOrderPlugin, basePlugin, splitLayerPlugin];
}

/**
 * Legacy implementation — handles the old astryxStylex({stylexOptions: {...}}) API.
 * Used by Storybook and other existing configs.
 */
function astryxStylexLegacy(options: AstryxVitePluginLegacyOptions): Plugin[] {
  const {
    stylexOptions,
    libraryPattern,
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
            extraLibraryPatterns: toPatterns(libraryPattern),
            babelConfig: undefined,
          },
        ],
        ...existingPlugins,
      ],
    },
  });

  const layerOrderPlugin = createLayerOrderPlugin(libraryLayer, productLayer);

  const splitLayerPlugin = createSplitLayerPlugin(
    libraryLayer,
    productLayer,
    stylexPrefix,
  );

  return [layerOrderPlugin, basePlugin, splitLayerPlugin];
}
