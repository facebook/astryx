import type {Plugin} from 'vite';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import stylex from '@stylexjs/unplugin';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const XDS_LIBRARY_PATTERN = 'node_modules/@xds/';
const STYLEX_CSS_PATH = '/virtual:stylex.css';

export interface XDSVitePluginOptions {
  /**
   * Options passed to @stylexjs/unplugin.
   * See https://stylexjs.com/docs/api/configuration/babel-plugin/
   */
  stylexOptions: Parameters<typeof stylex.vite>[0];

  /**
   * Pattern to identify XDS library files vs product files.
   * @default 'node_modules/@xds/'
   */
  libraryPattern?: string;

  /**
   * CSS layer names for the split output.
   */
  layers?: {
    /** Layer name for XDS library styles @default 'xds-base' */
    library?: string;
    /** Layer name for product styles @default 'product' */
    product?: string;
  };
}

/**
 * Vite plugin for XDS source builds.
 *
 * Wraps @stylexjs/unplugin to compile StyleX from both XDS library source
 * and product code, then splits the CSS output into separate named layers:
 *
 *   reset < xds-base (library) < xds-theme < product (app)
 *
 * The babel wrapper plugin (@xds/build/babel) is injected into the
 * unplugin's babelConfig.plugins so it runs BEFORE the hardcoded
 * StyleX instance. Our wrapper transforms stylex.create() calls with
 * the correct prefix per file, leaving nothing for the stock instance.
 */
export function xdsStylex(options: XDSVitePluginOptions): Plugin[] {
  const {
    stylexOptions,
    libraryPattern = XDS_LIBRARY_PATTERN,
    layers = {},
  } = options;

  const libraryLayer = layers.library ?? 'xds-base';
  const productLayer = layers.product ?? 'product';

  // Inject our babel wrapper as a user plugin — it runs before the
  // unplugin's hardcoded StyleX instance and handles prefix routing.
  const xdsBabelPlugin = path.resolve(__dirname, 'babel.js');
  const existingPlugins = stylexOptions.babelConfig?.plugins ?? [];

  const basePlugin = stylex.vite({
    ...stylexOptions,
    useCSSLayers: true,
    babelConfig: {
      ...stylexOptions.babelConfig,
      plugins: [
        [
          xdsBabelPlugin,
          {
            ...(stylexOptions as any),
            // Remove babelConfig to avoid circular reference
            babelConfig: undefined,
          },
        ],
        ...existingPlugins,
      ],
    },
  });

  // Layer order declaration plugin
  const layerOrderPlugin: Plugin = {
    name: 'xds-css-layer-order',
    transformIndexHtml() {
      return [
        {
          tag: 'style',
          children: `@layer reset, ${libraryLayer}, xds-theme, ${productLayer};`,
          injectTo: 'head-prepend',
        },
      ];
    },
  };

  // Split-layer interceptor plugin
  const splitLayerPlugin: Plugin = {
    name: 'xds-split-layers',
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
