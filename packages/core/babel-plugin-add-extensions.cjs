// Copyright (c) Meta Platforms, Inc. and affiliates.
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */

/**
 * Babel plugin that appends .js to relative import/export paths.
 *
 * TypeScript source uses extensionless imports (e.g. './XDSButton').
 * Node.js ESM requires explicit extensions for "type": "module" packages.
 * This plugin rewrites them during compilation so no postbuild step is needed.
 *
 * Handles both file imports ('./XDSButton' → './XDSButton.js') and
 * directory imports ('./domainTokens' → './domainTokens/index.js'), for
 * static import/export declarations and dynamic `import()` calls alike.
 * Dynamic specifiers otherwise reach dist verbatim and break strict-ESM
 * consumers (#4569). Babel 7 parses `import()` as a CallExpression with an
 * `Import` callee; Babel 8 emits an `ImportExpression` node — both handled.
 */
const fs = require('node:fs');
const nodePath = require('node:path');

module.exports = function addExtensions() {
  const SKIP = /\.(?:js|mjs|cjs|json|css)$/;

  /**
   * Rewrite one StringLiteral specifier node in place. `state` is the babel
   * plugin pass (state.filename = the importing source file).
   */
  function rewriteSpecifier(source, state) {
    const value = source.value;

    // Compat alias barrels self-re-export from `'.'` in source. Node ESM
    // does not support directory imports in built output, so make the self
    // reference explicit (`./index.js`) during compilation.
    if (value === '.') {
      source.value = './index.js';
      return;
    }
    if (value === '..') {
      source.value = '../index.js';
      return;
    }

    if (!value.startsWith('./') && !value.startsWith('../')) return;
    if (SKIP.test(value)) return;

    const dir = nodePath.dirname(state.filename);
    const asFile = nodePath.join(dir, value + '.ts');
    const asTsx = nodePath.join(dir, value + '.tsx');
    const asIndex = nodePath.join(dir, value, 'index.ts');
    const asIndexTsx = nodePath.join(dir, value, 'index.tsx');

    if (fs.existsSync(asFile) || fs.existsSync(asTsx)) {
      source.value = value + '.js';
    } else if (fs.existsSync(asIndex) || fs.existsSync(asIndexTsx)) {
      source.value = value + '/index.js';
    } else {
      source.value = value + '.js';
    }
  }

  return {
    visitor: {
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(
        path,
        state,
      ) {
        const source = path.node.source;
        if (!source) return;
        rewriteSpecifier(source, state);
      },
      // Dynamic import() under Babel 7. Only literal specifiers are
      // rewritten; computed ones cannot be resolved at build time.
      CallExpression(path, state) {
        if (path.node.callee.type !== 'Import') return;
        const [specifier] = path.node.arguments;
        if (!specifier || specifier.type !== 'StringLiteral') return;
        rewriteSpecifier(specifier, state);
      },
      // Dynamic import() under Babel 8 (or createImportExpressions parsing).
      ImportExpression(path, state) {
        const source = path.node.source;
        if (!source || source.type !== 'StringLiteral') return;
        rewriteSpecifier(source, state);
      },
    },
  };
};
