/**
 * @file inline-stylex.mjs
 * Post-build transform: resolves $$css style objects into class name strings.
 *
 * StyleX compiles styles into objects like:
 *   { kVAEAm: "x1n2onr6", k1xSpc: "x3nfvp2", $$css: true }
 *
 * At runtime, stylex.props() walks these objects to collect class names.
 * This transform resolves them at build time so the runtime just
 * concatenates strings.
 *
 * Requires: no null values in $$css objects (enforced by
 * @xds/no-stylex-null-override lint rule).
 *
 * Run after tsup build: node scripts/inline-stylex.mjs [dist-dir]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST_DIR = process.argv[2] || 'dist';
const RUNTIME_FILENAME = '__stylex-runtime.mjs';
const RUNTIME_IMPORT_NAME = '__stylexProps';

// Minimal runtime — just concatenates non-falsy string arguments.
// Also handles $$css objects from consumer xstyle passthrough.
const RUNTIME_MODULE = `/**
 * Minimal StyleX props runtime.
 * Internal style objects are pre-resolved to class name strings.
 * $$css object handling is kept for consumer xstyle passthrough.
 */
export function ${RUNTIME_IMPORT_NAME}() {
  var cls = '';
  for (var i = 0; i < arguments.length; i++) {
    var s = arguments[i];
    if (!s) continue;
    if (typeof s === 'string') {
      cls = cls ? cls + ' ' + s : s;
    } else if (s.$$css) {
      for (var prop in s) {
        if (prop !== '$$css' && typeof s[prop] === 'string') {
          cls = cls ? cls + ' ' + s[prop] : s[prop];
        }
      }
    }
  }
  return cls ? { className: cls } : {};
}
`;

/**
 * Extract class name strings from a $$css style object.
 */
function resolveToClassNames(objSource) {
  const classNames = [];
  // Match: key: "value" — keys can be unquoted identifiers or quoted strings (including --custom-props)
  const propPattern = /["']?([\w][\w-]*|--[\w-]+)["']?\s*:\s*"([^"]*?)"\s*[,}\n]/g;
  let m;
  while ((m = propPattern.exec(objSource)) !== null) {
    if (m[1] === '$$css') continue;
    classNames.push(m[2]);
  }
  return classNames;
}

function transformFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  let needsRuntime = false;

  // Step 1: Inline all $$css objects to strings
  const cssObjPattern = /\{[^{}]*\$\$css:\s*true[^{}]*\}/gs;
  content = content.replace(cssObjPattern, (match) => {
    // Skip objects with dynamic values (ternaries, function calls)
    if (/\?\s*"/.test(match) || /\w+\s*!=/.test(match)) {
      return match;
    }
    const classNames = resolveToClassNames(match);
    if (classNames.length === 0) return 'null'; // empty $$css → null
    return JSON.stringify(classNames.join(' '));
  });

  // Step 2: Find and replace the stylex runtime import + props() calls.
  // After bundling (@stylexjs/stylex is noExternal), the import becomes:
  //   import { props } from "./chunk-XXXX.mjs";
  // where the chunk contains the styleq runtime.
  // We also handle the pre-bundle pattern: import * as stylex from "@stylexjs/stylex"

  // Pattern A: bundled — import { props } from styleq chunk
  // After noExternal bundling, stylex.props becomes a bare `props` import
  // from the chunk containing the inlined styleq runtime.
  // Strategy: replace the import source with our runtime, keeping the name.
  const stylexChunkPattern = /import \{\s*props\s*\} from "(\.\/(chunk-[^"]+\.mjs))";/;
  const stylexChunkImport = content.match(stylexChunkPattern);
  if (stylexChunkImport) {
    // Replace the chunk import with our runtime import, renaming to avoid collision
    content = content.replace(
      stylexChunkImport[0],
      `import { ${RUNTIME_IMPORT_NAME} } from "./${RUNTIME_FILENAME}";`
    );
    // Rename all bare props( calls that came from stylex.
    // These are never preceded by a dot (that would be obj.props) or a letter
    // (that would be mergeProps, etc). They appear after: , ) ... = ( newline
    content = content.replace(/([^.\w])props\(/g, `$1${RUNTIME_IMPORT_NAME}(`);
    // Handle start-of-expression (e.g., spread: ...props()
    content = content.replace(/\.\.\.props\(/g, `...${RUNTIME_IMPORT_NAME}(`);
    needsRuntime = false; // import already added above
  }

  // Pattern B: pre-bundle — import * as stylex from "@stylexjs/stylex"
  if (/stylex\d*\.props\(/.test(content)) {
    content = content.replace(/stylex\d*\.props\(/g, `${RUNTIME_IMPORT_NAME}(`);
    needsRuntime = true;
  }
  content = content.replace(/import \* as stylex\d* from ["']@stylexjs\/stylex["'];?\n?/g, '');
  content = content.replace(/import \{[^}]*\} from ["']@stylexjs\/stylex["'];?\n?/g, '');

  const modified = content !== originalContent;

  // Step 4: Add runtime import
  if (needsRuntime) {
    const runtimeImport = `import { ${RUNTIME_IMPORT_NAME} } from "./${RUNTIME_FILENAME}";\n`;
    const importMatches = [...content.matchAll(/^import .+$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertPos = lastImport.index + lastImport[0].length + 1;
      content = content.slice(0, insertPos) + runtimeImport + content.slice(insertPos);
    } else {
      content = runtimeImport + content;
    }
  }

  if (modified || needsRuntime) {
    writeFileSync(filePath, content, 'utf8');
  }

  return { modified: modified || needsRuntime, needsRuntime };
}

// Main
console.log('Writing shared runtime...');
writeFileSync(join(DIST_DIR, RUNTIME_FILENAME), RUNTIME_MODULE);

const files = readdirSync(DIST_DIR).filter(f =>
  f.endsWith('.mjs') && f !== RUNTIME_FILENAME
);

let stats = { transformed: 0, withRuntime: 0, inlined: 0, kept: 0 };

for (const file of files) {
  const filePath = join(DIST_DIR, file);
  const before = readFileSync(filePath, 'utf8');
  const cssCountBefore = (before.match(/\$\$css:\s*true/g) || []).length;

  const result = transformFile(filePath);

  if (result.modified) {
    const after = readFileSync(filePath, 'utf8');
    const cssCountAfter = (after.match(/\$\$css:\s*true/g) || []).length;
    const inlined = cssCountBefore - cssCountAfter;

    stats.transformed++;
    stats.inlined += inlined;
    stats.kept += cssCountAfter;
    if (result.needsRuntime) stats.withRuntime++;

    if (inlined > 0 || result.needsRuntime) {
      console.log(`  ✓ ${file}: ${inlined}/${cssCountBefore} inlined${result.needsRuntime ? ' (+runtime)' : ''}`);
    }
  }
}

const runtimeSize = readFileSync(join(DIST_DIR, RUNTIME_FILENAME)).length;
console.log(`\nResults:`);
console.log(`  Inlined to strings: ${stats.inlined} objects`);
console.log(`  Kept as $$css:      ${stats.kept} objects (dynamic values)`);
console.log(`  Files transformed:  ${stats.transformed}`);
console.log(`  Runtime size:       ${runtimeSize} bytes`);
