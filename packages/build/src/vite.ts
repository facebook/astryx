// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Plugin, UserConfig} from 'vite';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import stylex from '@stylexjs/unplugin';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

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

            const rulesById =
              stylexPlugin?.__stylexGetSharedStore?.()?.rulesById;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-store');
            res.end(
              renderSplitLayers(rulesById, {
                libraryPattern,
                libraryLayer,
                productLayer,
              }),
            );
          },
        });
      };
    },
  };

  return [
    configPlugin,
    layerOrderPlugin,
    basePlugin,
    splitLayerPlugin,
    buildLayerSplitPlugin(basePlugin, {
      libraryPattern,
      libraryLayer,
      productLayer,
      lightningcssOptions: stylexOptions.lightningcssOptions,
    }),
  ];
}

/**
 * Partition StyleX's collected rules by the source file that authored them and
 * render each half into its cascade layer: Astryx's own styles into the library
 * layer (below `astryx-theme`, so a theme can override them), product styles
 * into the product layer (above it, so an app always wins).
 *
 * This is the one implementation. The dev middleware and the build hook differ
 * only in when they run and what they do with the string — the partition itself
 * must not diverge, because it did: the build shipped a version that wrapped
 * everything in the library layer, which put product styles UNDER a theme.
 *
 * `rulesById` is keyed by absolute source path, which is the only place the
 * distinction survives — by the time the CSS is text, the origin is gone.
 */
function renderSplitLayers(
  rulesById: Map<string, unknown[]> | undefined,
  options: {
    libraryPattern: string;
    libraryLayer: string;
    productLayer: string;
  },
): string {
  if (!rulesById || rulesById.size === 0) return '';

  const libraryRules: unknown[] = [];
  const productRules: unknown[] = [];

  for (const [filePath, rules] of rulesById.entries()) {
    if (filePath.includes(options.libraryPattern)) {
      libraryRules.push(...rules);
    } else {
      productRules.push(...rules);
    }
  }

  const render = (rules: unknown[], layer: string) =>
    rules.length
      ? `@layer ${layer} {\n${stylexBabelPlugin.processStylexRules(rules as never, {useLayers: true})}\n}`
      : '';

  return [
    render(libraryRules, options.libraryLayer),
    render(productRules, options.productLayer),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * The build half of the split. StyleX appends one merged block of CSS to the
 * build's stylesheet, in its own top-level `@layer priority1…priorityN` — which
 * is declared after `@layer reset, astryx-base, astryx-theme, product;` and so
 * outranks every one of them. On the dev server `astryx-split-layers` re-serves
 * the same rules already partitioned; a build had no equivalent, so a theme's
 * component overrides were silently dropped in the built app while working in
 * dev.
 *
 * This replaces that merged block with the partitioned pair. It runs in
 * `writeBundle` because StyleX emits through two different paths depending on
 * whether the bundle already has a stylesheet to append to (`generateBundle`)
 * or has to write its own file (`writeBundle`) — on disk, after both, there is
 * one case instead of two.
 *
 * The block is located by an exact match against StyleX's own collector rather
 * than by looking for `@layer priority1`: a wrong guess about where the block
 * starts silently moves rules between layers, which is the failure this exists
 * to prevent. If the rules exist and the block cannot be found, the build
 * fails.
 */
function buildLayerSplitPlugin(
  basePlugin: unknown,
  options: {
    libraryPattern: string;
    libraryLayer: string;
    productLayer: string;
    lightningcssOptions?: unknown;
  },
): Plugin {
  const stylex = basePlugin as {
    __stylexGetSharedStore?: () => {rulesById: Map<string, unknown[]>};
    __stylexCollectCss?: () => string;
  };
  let base = '/';

  return {
    name: 'astryx-build-layer-split',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      base = config.base ?? '/';
    },
    writeBundle(outputOptions) {
      const rulesById = stylex.__stylexGetSharedStore?.().rulesById;
      if (!rulesById || rulesById.size === 0) return;

      const merged = stylex.__stylexCollectCss?.();
      if (!merged) return;

      const split = postProcessCss(
        renderSplitLayers(rulesById, options),
        options.lightningcssOptions,
      );

      const outDir = outputOptions.dir
        ? outputOptions.dir
        : outputOptions.file
          ? path.dirname(outputOptions.file)
          : null;
      // `write: false` builds keep everything in memory; there is nothing to
      // patch and nothing was shipped, so this is not a failure.
      if (!outDir || !fs.existsSync(outDir)) return;

      const patched: string[] = [];
      for (const file of listCssFiles(outDir)) {
        const css = fs.readFileSync(file, 'utf-8');
        const at = css.lastIndexOf(merged);
        if (at === -1) continue;
        fs.writeFileSync(
          file,
          css.slice(0, at) + split + css.slice(at + merged.length),
        );
        patched.push(file);
      }

      if (patched.length === 0) {
        this.error(
          'astryx-build-layer-split: StyleX emitted rules but its CSS block ' +
            `was not found in any stylesheet under ${outDir}, so Astryx and ` +
            'product styles could not be separated into their cascade layers. ' +
            'Leaving the build unsplit would let product styles lose to a ' +
            'theme. This usually means the StyleX plugin version changed how ' +
            'it emits CSS.',
        );
        return;
      }

      linkOrphanStylesheets(outDir, patched, base);
    },
  };
}

/** Every `.css` file under a directory, recursively. */
function listCssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listCssFiles(full));
    else if (entry.name.endsWith('.css')) out.push(full);
  }
  return out;
}

/** Every `.html` file under a directory, recursively. */
function listHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Link a stylesheet the build wrote but no page loads.
 *
 * When an app imports no CSS of its own, StyleX has no bundle asset to append
 * to, so it writes `assets/stylex.css` itself — outside Rollup's graph, which
 * means Vite's HTML plugin never learns about it and emits no `<link>`. The app
 * ships every Astryx style correctly split into layers, and a completely
 * unstyled page. Importing any stylesheet hides it, which is why it survives:
 * the moment a project has one line of its own CSS the symptom disappears.
 *
 * Only orphans are linked. A stylesheet already referenced by a page is Vite's,
 * and touching it would duplicate the load. A build with no HTML at all —
 * library mode — is left alone: its consumer imports the CSS themselves.
 */
function linkOrphanStylesheets(
  outDir: string,
  cssFiles: string[],
  base: string,
): void {
  const pages = listHtmlFiles(outDir);
  if (pages.length === 0) return;

  const orphans = cssFiles.filter(css => {
    const name = path.basename(css);
    return !pages.some(page => fs.readFileSync(page, 'utf-8').includes(name));
  });
  if (orphans.length === 0) return;

  const links = orphans
    .map(css => {
      const href =
        base.replace(/\/$/, '') +
        '/' +
        path.relative(outDir, css).split(path.sep).join('/');
      return `<link rel="stylesheet" crossorigin href="${href}">`;
    })
    .join('\n    ');

  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf-8');
    if (!html.includes('</head>')) continue;
    fs.writeFileSync(page, html.replace('</head>', `  ${links}\n  </head>`));
  }
}

/**
 * StyleX runs its collected CSS through lightningcss before emitting it, so
 * anything replacing that output has to run the same pass or the build quietly
 * loses the vendor prefixes and lowering the original had.
 *
 * lightningcss ships with both Vite and the StyleX plugin, either of which must
 * be installed for this plugin to run at all. If it somehow is not resolvable,
 * the unprocessed CSS is correct — just less compatible — so this degrades
 * rather than failing the build.
 */
function postProcessCss(css: string, lightningcssOptions: unknown): string {
  if (!css) return css;
  try {
    const require_ = createRequire(import.meta.url);
    const {transform, browserslistToTargets} = require_('lightningcss');
    const browserslist = require_('browserslist');
    const {code} = transform({
      targets: browserslistToTargets(browserslist()),
      ...(lightningcssOptions as object),
      filename: 'stylex.css',
      code: Buffer.from(css),
    });
    return code.toString();
  } catch {
    return css;
  }
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

            const rulesById =
              stylexPlugin?.__stylexGetSharedStore?.()?.rulesById;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'no-store');
            res.end(
              renderSplitLayers(rulesById, {
                libraryPattern,
                libraryLayer,
                productLayer,
              }),
            );
          },
        });
      };
    },
  };

  return [
    layerOrderPlugin,
    basePlugin,
    splitLayerPlugin,
    buildLayerSplitPlugin(basePlugin, {
      libraryPattern,
      libraryLayer,
      productLayer,
      lightningcssOptions: (stylexOptions as {lightningcssOptions?: unknown})
        ?.lightningcssOptions,
    }),
  ];
}
