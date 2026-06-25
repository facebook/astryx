// Copyright (c) Meta Platforms, Inc. and affiliates.

"use strict";

/**
 * @astryxdesign/postcss-plugin
 *
 * PostCSS plugin for Astryx source builds. Compiles StyleX from both
 * Astryx library source and product code in two separate passes with
 * different class name prefixes, then outputs them in separate layers:
 *
 *   reset < astryx-base (library, prefix: 'astryx') < astryx-theme < product (prefix: 'x')
 *
 * The separate prefixes ensure atomic classes don't collide between
 * layers, which would break theme overrides.
 */

const path = require('node:path');
const fs = require('node:fs');
const postcss = require('postcss');
const babel = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const {globSync} = require('fast-glob');
const isGlob = require('is-glob');
const globParent = require('glob-parent');

const PLUGIN_NAME = '@astryxdesign/postcss-plugin';

const LIBRARY_GLOB = 'node_modules/@astryxdesign/**/*.{ts,tsx}';
const LIBRARY_PATTERNS = ['node_modules/@astryxdesign/', 'packages/core/', 'packages/themes/'];
const STYLEX_IMPORT_SOURCE = '@stylexjs/stylex';

function parseDependency(fileOrGlob, cwd) {
  if (fileOrGlob.startsWith('!')) return null;
  if (isGlob(fileOrGlob)) {
    const base = globParent(fileOrGlob);
    let glob = fileOrGlob.substring(base === '.' ? 0 : base.length);
    if (glob.charAt(0) === '/') glob = glob.substring(1);
    return {
      type: 'dir-dependency',
      dir: path.normalize(path.resolve(cwd, base)),
      glob,
    };
  }
  return {
    type: 'dependency',
    file: path.normalize(path.resolve(cwd, fileOrGlob)),
  };
}

/**
 * Clone a babel plugins array, overriding the classNamePrefix on the
 * StyleX babel plugin entry.
 */
function withClassNamePrefix(plugins, prefix) {
  return plugins.map(p => {
    if (!Array.isArray(p)) return p;
    const [pluginPath, opts] = p;
    // Match @stylexjs/babel-plugin by name
    const name = typeof pluginPath === 'string' ? pluginPath : '';
    if (name.includes('@stylexjs/babel-plugin') || name.includes('stylex')) {
      return [pluginPath, {...opts, classNamePrefix: prefix}];
    }
    return p;
  });
}

function createPlugin() {
  const isDev = process.env.NODE_ENV === 'development';

  // Separate rule maps for library and product
  const libraryRulesMap = new Map();
  const productRulesMap = new Map();
  const fileModifiedMap = new Map();

  const plugin = ({
    cwd = process.cwd(),
    appDir = 'src',
    babelPlugins = [],
    layers = {
      library: 'astryx-base',
      product: 'product',
    },
    // Class name prefix for library styles (product keeps default 'x')
    libraryPrefix = 'astryx',
    extraInclude = [],
    libraryPatterns = LIBRARY_PATTERNS,
    exclude = [],
  }) => {
    const include = [
      `${appDir}/**/*.{js,jsx,ts,tsx}`,
      LIBRARY_GLOB,
      ...extraInclude,
    ];

    const excludeWithDefaults = ['**/*.d.ts', '**/*.flow', ...exclude];

    // Two babel configs — different classNamePrefix
    const libraryBabelConfig = {
      babelrc: false,
      parserOpts: {plugins: ['typescript', 'jsx']},
      plugins: withClassNamePrefix(babelPlugins, libraryPrefix),
    };

    const productBabelConfig = {
      babelrc: false,
      parserOpts: {plugins: ['typescript', 'jsx']},
      plugins: babelPlugins, // keeps default 'x' prefix
    };

    let shouldSkipTransformError = false;

    return {
      postcssPlugin: PLUGIN_NAME,
      plugins: [
        async function (root, result) {
          const fileName = result.opts.from;

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
              result.messages.push({
                plugin: PLUGIN_NAME,
                parent: fileName,
                ...dep,
              });
            }
          }

          // Remove deleted files
          for (const f of fileModifiedMap.keys()) {
            if (!files.has(f)) {
              fileModifiedMap.delete(f);
              libraryRulesMap.delete(f);
              productRulesMap.delete(f);
            }
          }

          // Partition files into library vs product, then compile
          // each group with its own babel config (different prefix)
          const transforms = [];
          for (const filePath of files) {
            const mtimeMs = fs.existsSync(filePath)
              ? fs.statSync(filePath).mtimeMs
              : -Infinity;
            if (
              fileModifiedMap.has(filePath) &&
              mtimeMs === fileModifiedMap.get(filePath)
            ) {
              continue;
            }
            fileModifiedMap.set(filePath, mtimeMs);

            const contents = fs.readFileSync(filePath, 'utf-8');
            if (!contents.includes(STYLEX_IMPORT_SOURCE)) continue;

            const isLibrary = libraryPatterns.some(p => filePath.includes(p));
            const config = isLibrary ? libraryBabelConfig : productBabelConfig;
            const rulesMap = isLibrary ? libraryRulesMap : productRulesMap;

            transforms.push(
              babel
                .transformAsync(contents, {
                  filename: filePath,
                  caller: {name: PLUGIN_NAME, platform: 'web', isDev},
                  ...config,
                })
                .then(({metadata}) => {
                  const stylex = metadata?.stylex;
                  if (stylex != null && stylex.length > 0) {
                    rulesMap.set(filePath, stylex);
                  }
                })
                .catch((error) => {
                  if (shouldSkipTransformError) {
                    console.warn(
                      `[${PLUGIN_NAME}] Failed to transform "${filePath}": ${error.message}`,
                    );
                  } else {
                    throw error;
                  }
                }),
            );
          }
          await Promise.all(transforms);

          // Collect rules from each map
          const libraryRules = Array.from(libraryRulesMap.values()).flat();
          const productRules = Array.from(productRulesMap.values()).flat();

          // Process each group separately
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

          // Wrap in named layers
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
