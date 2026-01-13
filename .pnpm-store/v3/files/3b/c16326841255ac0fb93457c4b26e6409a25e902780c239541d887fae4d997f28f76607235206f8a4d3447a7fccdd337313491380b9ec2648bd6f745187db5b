import path from 'path';
import { promises } from 'fs';
import { transformAsync } from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import flowSyntaxPlugin from '@babel/plugin-syntax-flow';
import hermesParserPlugin from 'babel-plugin-syntax-hermes-parser';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import { utils } from '@stylexjs/shared';
const {
  readFile,
  writeFile,
  mkdir
} = promises;
const PACKAGE_NAME = 'esbuild-plugin-stylex';
const IS_DEV_ENV = process.env.NODE_ENV === 'development' || process.env.BABEL_ENV === 'development';
const STYLEX_PLUGIN_ONLOAD_FILTER = /\.(jsx|js|tsx|ts|mjs|cjs|mts|cts)$/;
export default function stylexPlugin() {
  let {
    dev = IS_DEV_ENV,
    unstable_moduleResolution = {
      type: 'commonJS',
      rootDir: process.cwd()
    },
    stylexImports = ['@stylexjs/stylex'],
    generatedCSSFileName = path.resolve(__dirname, 'stylex.css'),
    babelConfig: {
      plugins = [],
      presets = []
    } = {},
    useCSSLayers = false,
    ...options
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    name: PACKAGE_NAME,
    async setup(build) {
      const stylexRules = {};
      build.onEnd(async _ref => {
        let {
          outputFiles
        } = _ref;
        const rules = Object.values(stylexRules).flat();
        if (rules.length === 0) {
          return;
        }
        const collectedCSS = stylexBabelPlugin.processStylexRules(rules, useCSSLayers);
        const shouldWriteToDisk = build.initialOptions.write === undefined || build.initialOptions.write;
        if (shouldWriteToDisk) {
          await mkdir(path.dirname(generatedCSSFileName), {
            recursive: true
          });
          await writeFile(generatedCSSFileName, collectedCSS, 'utf8');
          return;
        }
        if (outputFiles !== undefined) {
          outputFiles.push({
            path: '<stdout>',
            contents: new TextEncoder().encode(collectedCSS),
            hash: utils.hash(new Date().getTime().toString()),
            get text() {
              return collectedCSS;
            }
          });
        }
      });
      build.onLoad({
        filter: STYLEX_PLUGIN_ONLOAD_FILTER
      }, async args => {
        const currFilePath = args.path;
        const inputCode = await readFile(currFilePath, 'utf8');
        if (!stylexImports.some(importName => inputCode.includes(importName))) {
          return;
        }
        const transformResult = await transformAsync(inputCode, {
          babelrc: false,
          filename: currFilePath,
          presets,
          plugins: [...plugins, ...getFlowOrTypeScriptBabelSyntaxPlugins(currFilePath), jsxSyntaxPlugin, stylexBabelPlugin.withOptions({
            treeshakeCompensation: true,
            ...options,
            dev,
            unstable_moduleResolution
          })]
        });
        const loader = getEsbuildLoader(currFilePath);
        if (transformResult === null) {
          console.warn('StyleX: transformAsync returned null');
          return {
            contents: inputCode,
            loader
          };
        }
        const {
          code,
          metadata
        } = transformResult;
        if (code === null) {
          console.warn('StyleX: transformAsync returned null code');
          return {
            contents: inputCode,
            loader
          };
        }
        if (!dev && metadata.stylex !== null && metadata.stylex.length > 0) {
          stylexRules[args.path] = metadata.stylex;
        }
        return {
          contents: code,
          loader
        };
      });
    }
  };
}
function getEsbuildLoader(fileName) {
  if (fileName.endsWith('.tsx')) {
    return 'tsx';
  }
  if (fileName.endsWith('.jsx')) {
    return 'jsx';
  }
  if (fileName.endsWith('ts')) {
    return 'ts';
  }
  return 'js';
}
function getFlowOrTypeScriptBabelSyntaxPlugins(fileName) {
  if (/\.jsx?/.test(path.extname(fileName))) {
    return [flowSyntaxPlugin, hermesParserPlugin];
  }
  return [[typescriptSyntaxPlugin, {
    isTSX: true
  }]];
}