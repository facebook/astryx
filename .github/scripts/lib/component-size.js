// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file component-size.js
 * @input A built package's dist directory, a component's dist entry, and the
 *   package's prebuilt stylesheet
 * @output The gzip size of the JavaScript a component's import pulls in
 *   (one minified bundle of every module it reaches, package imports included)
 *   and the gzip size of the stylesheet rules that JavaScript references
 * @position Shared by analyze-pr.js for the PR size report. Sizes are gzip at
 *   the default compression level (spec:AST-080 FR8,
 *   architecture:component-style-authoring INV6).
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

function gzipBytes(text) {
  return zlib.gzipSync(Buffer.from(text, 'utf8')).length;
}

// The package's prebuilt stylesheet: `dist/<name>.css` from its `.css` export
// other than the reset and Tailwind theme files.
function packageStylesheetPath(packageDir) {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
    );
    const keys = Object.keys(manifest.exports || {}).filter(
      key =>
        key.endsWith('.css') &&
        key !== './reset.css' &&
        key !== './tailwind-theme.css',
    );
    for (const key of keys) {
      const target = manifest.exports[key];
      const file = typeof target === 'string' ? target : target?.default;
      if (!file) continue;
      const resolved = path.join(packageDir, file);
      if (fs.existsSync(resolved)) return resolved;
    }
  } catch {
    // An unreadable manifest has no stylesheet to measure.
  }
  return null;
}

// Bundle what importing `entry` pulls in: every module it reaches, including
// modules reached through package imports (other Astryx packages, React,
// StyleX, third-party libraries), minified for production. Returns the bundle
// text, or null when the import cannot be bundled.
function bundleImport(entry) {
  if (!entry || !fs.existsSync(entry)) return null;
  try {
    const esbuild = require('esbuild');
    const result = esbuild.buildSync({
      stdin: {
        contents: `export * from ${JSON.stringify(path.resolve(entry))};`,
        resolveDir: path.dirname(path.resolve(entry)),
        loader: 'js',
      },
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      define: {'process.env.NODE_ENV': '"production"'},
      loader: {'.css': 'empty'},
      write: false,
      logLevel: 'silent',
    });
    return result.outputFiles[0].text;
  } catch {
    return null;
  }
}

// StyleX atomic class names the bundle references.
function classNamesIn(js) {
  return new Set(js.match(/\bx[a-z0-9]{3,12}\b/g) || []);
}

// Parse CSS into nested blocks: {prelude, children} for block rules and
// {prelude} for statements. Comments are dropped; strings are kept intact.
function parseBlocks(css) {
  let index = 0;
  function skipComment() {
    if (css.startsWith('/*', index)) {
      const end = css.indexOf('*/', index + 2);
      index = end < 0 ? css.length : end + 2;
      return true;
    }
    return false;
  }
  function readUntil(stops) {
    let out = '';
    while (index < css.length && !stops.includes(css[index])) {
      if (skipComment()) continue;
      const ch = css[index];
      if (ch === '"' || ch === "'") {
        const start = index;
        index += 1;
        while (index < css.length && css[index] !== ch) {
          if (css[index] === '\\') index += 1;
          index += 1;
        }
        index += 1;
        out += css.slice(start, index);
        continue;
      }
      out += ch;
      index += 1;
    }
    return out;
  }
  function parseList() {
    const nodes = [];
    while (index < css.length) {
      const prelude = readUntil(['{', ';', '}']).trim();
      const ch = css[index];
      if (ch === '}') {
        index += 1;
        break;
      }
      index += 1;
      if (ch === ';' || ch === undefined) {
        if (prelude) nodes.push({prelude});
        continue;
      }
      // A style rule's body holds declarations; an at-rule's body may hold rules.
      if (
        prelude.startsWith('@') &&
        !/^@(font-face|page|property)\b/.test(prelude)
      ) {
        nodes.push({prelude, children: parseList()});
      } else {
        const body = readUntil(['}']);
        index += 1;
        nodes.push({prelude, body});
      }
    }
    return nodes;
  }
  return parseList();
}

// The stylesheet rules whose selectors name one of `classes`, inside the
// at-rules that wrap them, plus the @keyframes those rules name.
function rulesForClasses(css, classes) {
  if (!css || classes.size === 0) return '';
  const classPattern = /\.([A-Za-z_][\w-]*)/g;
  const tree = parseBlocks(css);
  function keep(nodes, keyframes) {
    let out = '';
    for (const node of nodes) {
      if (node.children) {
        const name = /^@(?:-webkit-)?keyframes\s+([\w-]+)/.exec(
          node.prelude,
        )?.[1];
        if (name !== undefined) {
          if (keyframes.has(name)) {
            out += `${node.prelude}{${node.children.map(child => `${child.prelude}{${child.body ?? ''}}`).join('')}}`;
          }
          continue;
        }
        const inner = keep(node.children, keyframes);
        if (inner) out += `${node.prelude}{${inner}}`;
      } else if (node.body !== undefined) {
        const names = [...node.prelude.matchAll(classPattern)].map(m => m[1]);
        if (names.some(name => classes.has(name))) {
          out += `${node.prelude}{${node.body}}`;
        }
      }
    }
    return out;
  }
  const rules = keep(tree, new Set());
  // Keyframes a kept rule names through `animation` or `animation-name`.
  const named = new Set();
  for (const match of rules.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
    for (const token of match[1].split(/[\s,]+/)) if (token) named.add(token);
  }
  return named.size === 0 ? rules : keep(tree, named);
}

/**
 * Measure one component import: gzip JavaScript it pulls in and gzip CSS of
 * the stylesheet rules that JavaScript references. Null where unmeasurable.
 */
function measureComponentImport(entry, stylesheetText) {
  const js = bundleImport(entry);
  if (js === null) return {importGzipBytes: null, cssGzipBytes: null};
  const css = stylesheetText
    ? rulesForClasses(stylesheetText, classNamesIn(js))
    : null;
  return {
    importGzipBytes: gzipBytes(js),
    cssGzipBytes: css === null ? null : gzipBytes(css),
  };
}

module.exports = {
  gzipBytes,
  packageStylesheetPath,
  bundleImport,
  classNamesIn,
  rulesForClasses,
  measureComponentImport,
};
