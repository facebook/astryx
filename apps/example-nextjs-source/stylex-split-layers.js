/* global module, require */
/**
 * @file stylex-split-layers.js
 *
 * Custom PostCSS plugin that compiles StyleX and splits the output CSS
 * into separate named layers based on source file path:
 *
 *   reset < xds-base (library styles) < xds-theme < product (app styles)
 *
 * This enables the source build path where both XDS components and
 * product code are compiled from StyleX source in a single pass, but
 * the resulting CSS respects the design system's cascade ordering.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postcss = require('postcss');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const babel = require('@babel/core');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {globSync} = require('fast-glob');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const isGlob = require('is-glob');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const globParent = require('glob-parent');

const PLUGIN_NAME = 'stylex-split-layers';

function parseDependency(fileOrGlob, cwd) {
  if (fileOrGlob.startsWith('!')) return null;
  const {normalize, resolve} = path;
  if (isGlob(fileOrGlob)) {
    const base = globParent(fileOrGlob);
    let glob = fileOrGlob.substring(base === '.' ? 0 : base.length);
    if (glob.charAt(0) === '/') glob = glob.substring(1);
    return {type: 'dir-dependency', dir: normalize(resolve(cwd, base)), glob};
  }
  return {type: 'dependency', file: normalize(resolve(cwd, fileOrGlob))};
}

function createPlugin() {
  const isDev = process.env.NODE_ENV === 'development';

  // Internal state — persists across rebuilds for watch mode
  const styleXRulesMap = new Map(); // filePath → stylex rules
  const fileModifiedMap = new Map(); // filePath → mtime

  const plugin = ({
    cwd = process.cwd(),
    babelConfig = {},
    include = [],
    exclude = [],
    importSources = ['@stylexjs/stylex'],
    libraryPattern = 'node_modules/@xds/',
    layers = {
      library: 'xds-base',
      product: 'product',
      order: ['reset', 'xds-base', 'xds-theme', 'product'],
    },
  }) => {
    // Resolve babel config
    const effectiveBabelConfig =
      babelConfig.babelrc === false ? babelConfig : babelConfig;

    const excludeWithDefaults = ['**/*.d.ts', '**/*.flow', ...exclude];

    let shouldSkipTransformError = false;

    return {
      postcssPlugin: PLUGIN_NAME,
      plugins: [
        async function (root, result) {
          const fileName = result.opts.from;

          // Find @stylex at-rule
          let styleXAtRule = null;
          root.walkAtRules((atRule) => {
            if (atRule.name === 'stylex' && !atRule.params) {
              styleXAtRule = atRule;
            }
          });
          if (styleXAtRule == null) return;

          // Discover files
          const files = new Set();
          for (const pattern of include) {
            const matched = globSync(pattern, {
              onlyFiles: true,
              ignore: excludeWithDefaults,
              cwd,
            });
            for (const f of matched) {
              files.add(path.normalize(path.resolve(cwd, f)));
            }
          }

          // Watch dependencies
          for (const pattern of include) {
            const dep = parseDependency(pattern, cwd);
            if (dep) {
              result.messages.push({plugin: PLUGIN_NAME, parent: fileName, ...dep});
            }
          }

          // Remove deleted files
          for (const f of fileModifiedMap.keys()) {
            if (!files.has(f)) {
              fileModifiedMap.delete(f);
              styleXRulesMap.delete(f);
            }
          }

          // Transform changed files
          const transforms = [];
          for (const filePath of files) {
            const mtimeMs = fs.existsSync(filePath)
              ? fs.statSync(filePath).mtimeMs
              : -Infinity;
            if (fileModifiedMap.has(filePath) && mtimeMs === fileModifiedMap.get(filePath)) {
              continue;
            }
            fileModifiedMap.set(filePath, mtimeMs);

            const contents = fs.readFileSync(filePath, 'utf-8');

            // Quick check: does this file import stylex?
            const hasStyleX = importSources.some((src) => {
              const from = typeof src === 'string' ? src : src.from;
              return contents.includes(from);
            });
            if (!hasStyleX) continue;

            transforms.push(
              babel
                .transformAsync(contents, {
                  filename: filePath,
                  caller: {name: PLUGIN_NAME, platform: 'web', isDev},
                  ...effectiveBabelConfig,
                })
                .then(({metadata}) => {
                  const stylex = metadata?.stylex;
                  if (stylex != null && stylex.length > 0) {
                    styleXRulesMap.set(filePath, stylex);
                  }
                })
                .catch((error) => {
                  if (shouldSkipTransformError) {
                    console.warn(`[${PLUGIN_NAME}] Failed to transform "${filePath}": ${error.message}`);
                  } else {
                    throw error;
                  }
                }),
            );
          }
          await Promise.all(transforms);

          // Partition rules by source path
          const libraryRules = [];
          const productRules = [];
          for (const [filePath, rules] of styleXRulesMap.entries()) {
            if (filePath.includes(libraryPattern)) {
              libraryRules.push(...rules);
            } else {
              productRules.push(...rules);
            }
          }

          // Process each group separately
          const libraryCss = libraryRules.length
            ? stylexBabelPlugin.processStylexRules(libraryRules, {useLayers: true})
            : '';
          const productCss = productRules.length
            ? stylexBabelPlugin.processStylexRules(productRules, {useLayers: true})
            : '';

          // Wrap in named layers with explicit ordering
          const parts = [];
          if (libraryCss) {
            parts.push(`@layer ${layers.library} {\n${libraryCss}\n}`);
          }
          if (productCss) {
            parts.push(`@layer ${layers.product} {\n${productCss}\n}`);
          }

          const finalCss = parts.join('\n\n');
          const parsed = await postcss.parse(finalCss, {from: fileName});
          styleXAtRule.replaceWith(parsed);
          result.root = root;

          if (!shouldSkipTransformError) {
            shouldSkipTransformError = true;
          }
        },
      ],
    };
  };

  plugin.postcss = true;
  return plugin;
}

module.exports = createPlugin();
