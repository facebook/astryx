// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle command — Copy component source for customization
 *
 * Resolves component source from packages/core/src/{Component}/,
 * recursively copies non-test files to the output directory, and
 * rewrites relative imports to use '@xds/core' package paths when
 * the target subpath is a real public export.
 *
 * For deep relative imports that target internal helpers not exposed
 * by '@xds/core' (e.g. internal *.stylex modules), the source file is
 * inlined alongside the swizzled component so the output type-checks
 * without mutating the published package surface.
 *
 * After swizzling, optionally prompts the user to file a gap report
 * explaining why they needed to customize the component.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as p from '@clack/prompts';
import {findCoreDir, listComponents} from '../utils/paths.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';
import {
  checkGhCli,
  createGapReport,
  loadGapReportConfig,
  GAP_CATEGORIES,
} from '../utils/github.mjs';

const SOURCE_EXTS = ['.ts', '.tsx', '.mts', '.cts'];
const INTERNAL_DIR = '_xdsInternal';

/**
 * Load the public export subpaths declared by @xds/core's package.json.
 * Returns a Set of subpath strings like 'theme', 'Layout', 'XDSBaseProps',
 * 'theme/tokens.stylex'. Subpaths are normalized without the leading './'.
 */
function loadCoreExports(coreDir) {
  const pkgPath = path.join(coreDir, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const exports = pkg.exports || {};
    const subpaths = new Set();
    for (const key of Object.keys(exports)) {
      if (key === '.' || !key.startsWith('./')) continue;
      subpaths.add(key.slice(2));
    }
    return subpaths;
  } catch {
    return new Set();
  }
}

/**
 * Best-effort parse of an index.ts barrel file. Returns the set of
 * exported names, separated into type-only and value re-exports.
 *
 * Handles:
 *   export {a, b as c} from './x';                  → values
 *   export type {T} from './y';                     → types
 *   export {a, type T} from './z';                  → mixed
 *   export const foo = ...;                         → value
 *   export function foo(...) {...}                  → value
 *   export class Foo {...}                          → value (and type)
 *   export interface I {...}                        → type
 *   export type Alias = ...;                        → type
 *   export {a as default} from './z';               → skipped
 *
 * `export *` is treated as opaque (we set hasWildcard=true; callers
 * are optimistic when wildcards are present).
 *
 * Returns { values: Set, types: Set, hasWildcard: bool } or null when
 * the file isn't readable.
 */
function readBarrelExports(barrelPath) {
  if (!fs.existsSync(barrelPath)) return null;
  let src;
  try {
    src = fs.readFileSync(barrelPath, 'utf-8');
  } catch {
    return null;
  }

  const values = new Set();
  const types = new Set();
  let hasWildcard = false;

  // export * from '...' or export type * from '...'
  const wildcardRe = /export\s+(?:type\s+)?\*\s+from\s+['"][^'"]+['"]/g;
  if (wildcardRe.test(src)) hasWildcard = true;

  // export type {T, U as V} from '...';
  // export type {T, U};
  const typeNamedRe = /export\s+type\s+\{([^}]+)\}/g;
  let m;
  while ((m = typeNamedRe.exec(src)) !== null) {
    for (const part of m[1].split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const asMatch = trimmed.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
      if (asMatch) types.add(asMatch[2]);
      else {
        const ident = trimmed.match(/^([\w$]+)$/);
        if (ident) types.add(ident[1]);
      }
    }
  }

  // export {a, type T, b as c} from '...';
  // (without leading 'type' keyword)
  const valueNamedRe = /export\s+\{([^}]+)\}/g;
  while ((m = valueNamedRe.exec(src)) !== null) {
    for (const part of m[1].split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      let isType = false;
      let body = trimmed;
      if (body.startsWith('type ')) {
        isType = true;
        body = body.slice(5).trim();
      }
      const asMatch = body.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
      const name = asMatch ? asMatch[2] : (body.match(/^([\w$]+)$/) || [])[1];
      if (!name) continue;
      if (isType) types.add(name);
      else values.add(name);
    }
  }

  // Direct declarations.
  // type/interface → type-only.
  // const/let/var/function/class/enum → value (class/enum also create
  // type names but for the purpose of import resolution treating them
  // as values is sufficient since value imports work for them).
  const valueDeclRe = /export\s+(?:async\s+)?(?:default\s+)?(?:const|let|var|function\*?|class|enum)\s+([\w$]+)/g;
  while ((m = valueDeclRe.exec(src)) !== null) {
    values.add(m[1]);
  }

  const typeDeclRe = /export\s+(?:default\s+)?(?:type|interface)\s+([\w$]+)/g;
  while ((m = typeDeclRe.exec(src)) !== null) {
    types.add(m[1]);
  }

  return {values, types, hasWildcard};
}

/**
 * Parse the imported names from an `import ... from '...'` statement
 * given the import statement text up to the closing brace.
 *
 * Returns { names, hasNamespace, hasDefault, isTypeOnly } where
 *   - names: array of { name, isType } records (per-name 'type' flag
 *     captures `import {type Foo}` mixed forms).
 *   - isTypeOnly: true when the whole import was `import type {...}`.
 */
function parseImportNames(importClause, isTypeOnlyClause = false) {
  const names = [];
  let hasNamespace = false;
  let hasDefault = false;

  const clause = importClause.trim();

  function pushFromBrace(inner, blanketType) {
    for (const part of inner.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      let isType = blanketType;
      let body = trimmed;
      if (body.startsWith('type ')) {
        isType = true;
        body = body.slice(5).trim();
      }
      const asMatch = body.match(/^([\w$]+)\s+as\s+[\w$]+$/);
      if (asMatch) {
        names.push({name: asMatch[1], isType});
        continue;
      }
      const ident = body.match(/^([\w$]+)$/);
      if (ident) names.push({name: ident[1], isType});
    }
  }

  if (clause.startsWith('*')) {
    hasNamespace = true;
    return {names, hasNamespace, hasDefault, isTypeOnly: isTypeOnlyClause};
  }

  // Default before braces: `Foo`, `Foo, {a, b}`, `Foo, * as ns`
  if (!clause.startsWith('{')) {
    const defaultMatch = clause.match(/^([\w$]+)(?:\s*,\s*(.*))?$/);
    if (defaultMatch) {
      hasDefault = true;
      const remainder = defaultMatch[2];
      if (remainder) {
        if (remainder.trim().startsWith('*')) {
          hasNamespace = true;
        } else {
          const braceMatch = remainder.match(/\{([^}]+)\}/);
          if (braceMatch) pushFromBrace(braceMatch[1], isTypeOnlyClause);
        }
      }
      return {names, hasNamespace, hasDefault, isTypeOnly: isTypeOnlyClause};
    }
  }

  const braceMatch = clause.match(/\{([^}]+)\}/);
  if (braceMatch) pushFromBrace(braceMatch[1], isTypeOnlyClause);

  return {names, hasNamespace, hasDefault, isTypeOnly: isTypeOnlyClause};
}

/**
 * Build a rewriter for relative imports. Closes over coreDir + exports map.
 *
 * Returns { rewrite, copies } where:
 *   - rewrite(content, fileRelPath) → rewritten content
 *   - copies: Map<sourceAbsPath, outputRelPath> of internal helpers
 *     that need to be inlined alongside the swizzled component.
 *
 * fileRelPath is the path of the file being rewritten relative to the
 * swizzle output root (e.g. 'XDSCard.tsx' or 'hooks/useFoo.ts'). It
 * determines the relative path used for inlined deps.
 */
export function createImportRewriter(options = {}) {
  const {coreDir, exports = new Set()} = options;
  const copies = new Map(); // absSourcePath -> outputRelativePath under INTERNAL_DIR
  const barrelCache = new Map(); // dir -> {names: Set, hasWildcard: bool} | null

  function getBarrelExports(topDir) {
    if (barrelCache.has(topDir)) return barrelCache.get(topDir);
    if (!coreDir) {
      barrelCache.set(topDir, null);
      return null;
    }
    const barrelPath = path.join(coreDir, 'src', topDir, 'index.ts');
    const result = readBarrelExports(barrelPath);
    barrelCache.set(topDir, result);
    return result;
  }

  function resolveSourceFile(absBase) {
    // absBase has no extension. Try .ts, .tsx, .mts, .cts, and /index.ts
    for (const ext of SOURCE_EXTS) {
      const candidate = absBase + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
    for (const ext of SOURCE_EXTS) {
      const candidate = path.join(absBase, 'index' + ext);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
    return null;
  }

  function planInlineCopy(absSourcePath) {
    // Compute output relative path (under INTERNAL_DIR) preserving
    // the subdirectory structure beneath packages/core/src.
    const srcRoot = path.join(coreDir || '', 'src');
    let rel;
    if (coreDir && absSourcePath.startsWith(srcRoot + path.sep)) {
      rel = path.relative(srcRoot, absSourcePath);
    } else {
      rel = path.basename(absSourcePath);
    }
    const outputRel = path.join(INTERNAL_DIR, rel);
    copies.set(absSourcePath, outputRel);
    return outputRel;
  }

  /**
   * Decide whether the imported names are all re-exported from the
   * public barrel for `topDir` in a way that satisfies the import.
   *
   * importedNames: array of { name, isType } records.
   *
   * A type-position import is satisfied if the barrel re-exports the
   * name as either a type or a value (since classes/enums act as both).
   * A value-position import is satisfied only when the barrel re-exports
   * the name as a value.
   */
  function barrelCovers(topDir, importedNames) {
    if (importedNames.length === 0) {
      // Side-effect-only or namespace import; assume the barrel works.
      return true;
    }
    const barrel = getBarrelExports(topDir);
    if (!barrel) return false;
    if (barrel.hasWildcard) return true; // can't know — be optimistic
    return importedNames.every(({name, isType}) => {
      if (isType) {
        return barrel.values.has(name) || barrel.types.has(name);
      }
      return barrel.values.has(name);
    });
  }

  /**
   * Rewrite a single relative import. Returns the rewritten import
   * specifier string (without quotes).
   *
   * The function handles three categories:
   *   - Same-level './x' imports → preserved (resolved within the
   *     swizzled output).
   *   - Out-of-component imports that resolve under packages/core/src/
   *     → rewritten to '@xds/core/<topDir>' or inlined under
   *     INTERNAL_DIR depending on whether the public barrel exports
   *     the imported symbols.
   *   - External or unresolvable paths → preserved as-is.
   */
  function rewriteOne(importPath, importedNames, fileAbsPath, fileOutputRel, opts = {}) {
    const {processSameDir = false} = opts;
    if (importPath.startsWith('./')) {
      if (!processSameDir) return importPath;
      // fall through to general resolution
    } else if (!importPath.startsWith('../')) {
      return importPath;
    }
    if (!coreDir) {
      // Legacy mode: naive top-dir extraction (matches old behavior
      // for the simple '../X/y' shape).
      const parts = importPath.replace(/^\.\.\//, '').split('/');
      return `@xds/core/${parts[0]}`;
    }

    // Resolve the import to an absolute path within packages/core/src.
    const absImport = path.resolve(path.dirname(fileAbsPath), importPath);
    const srcRoot = path.join(coreDir, 'src');
    if (!absImport.startsWith(srcRoot + path.sep) && absImport !== srcRoot) {
      // Resolves outside packages/core/src — leave alone.
      return importPath;
    }

    const subRel = path.relative(srcRoot, absImport).split(path.sep).join('/');
    const parts = subRel.split('/');
    const topDir = parts[0];
    const rest = parts.slice(1).join('/');

    // 1. Deepest match: 'topDir/rest' as a literal published subpath.
    if (rest && exports.has(`${topDir}/${rest}`)) {
      return `@xds/core/${topDir}/${rest}`;
    }

    // 2. Top-level file: '../XDSBaseProps' or similar (no nested dir).
    if (parts.length === 1 && exports.has(topDir)) {
      return `@xds/core/${topDir}`;
    }

    // 3. Shallow component/module barrel: '../Foo' or '../Foo/index'.
    const isShallow = !rest || rest === 'index';
    if (isShallow && exports.has(topDir)) {
      return `@xds/core/${topDir}`;
    }

    // 4. Deep import into a public-barrel directory. Check whether the
    // imported symbols are actually re-exported from the barrel. If yes,
    // use the barrel; if not, inline the file.
    if (exports.has(topDir) && barrelCovers(topDir, importedNames)) {
      return `@xds/core/${topDir}`;
    }

    // 5. Internal helper. Inline the file alongside the swizzled output.
    const resolved = resolveSourceFile(absImport);
    if (!resolved) {
      return importPath; // can't resolve; preserve original
    }

    const outputRel = planInlineCopy(resolved);
    const fileOutputDir = path.dirname(fileOutputRel);
    let rel = path.relative(fileOutputDir, outputRel);
    rel = rel.replace(/\.(ts|tsx|mts|cts)$/, '');
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
  }

  function rewrite(content, fileAbsPath, fileOutputRel, opts = {}) {
    const {processSameDir = false} = opts;
    // Match full import / re-export statements so we can also extract
    // the imported names. We capture: optional 'type', the clause
    // (default + braces or namespace or just braces), then 'from "..."'.
    const importRe = /(import|export)(\s+type)?\s+(\{[^}]*\}|\*\s+as\s+[\w$]+|[\w$]+(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+[\w$]+))?)\s+from\s+(['"])(\.{1,2}\/[^'"]+)\4/g;
    const sideEffectRe = /(import)\s+(['"])(\.{1,2}\/[^'"]+)\2/g;

    let result = content.replace(importRe, (match, kind, typeKw, clause, quote, importPath) => {
      const isTypeOnly = !!typeKw;
      let names = [];
      let hasNamespace = false;
      try {
        const parsed = parseImportNames(clause, isTypeOnly);
        names = parsed.names;
        hasNamespace = parsed.hasNamespace;
      } catch {
        // fall through with empty names
      }
      const namesForBarrel = hasNamespace ? [] : names;
      const next = rewriteOne(importPath, namesForBarrel, fileAbsPath, fileOutputRel, {processSameDir});
      const typePart = isTypeOnly ? ' type' : '';
      return `${kind}${typePart} ${clause} from ${quote}${next}${quote}`;
    });

    // Side-effect imports (no clause): import './foo'
    result = result.replace(sideEffectRe, (match, kind, quote, importPath) => {
      const next = rewriteOne(importPath, [], fileAbsPath, fileOutputRel, {processSameDir});
      return `${kind} ${quote}${next}${quote}`;
    });

    return result;
  }

  return {rewrite, copies};
}

/**
 * Backwards-compatible naive rewriter (no coreDir / no inlining).
 * Used by older tests; matches the original v0 behavior.
 *
 * @deprecated Use createImportRewriter({coreDir, exports}) instead.
 */
export function rewriteImports(content) {
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (_match, prefix, importPath, suffix) => {
      const parts = importPath.replace(/^\.\.\//, '').split('/');
      const topDir = parts[0];
      return `${prefix}@xds/core/${topDir}${suffix}`;
    },
  );
}

/**
 * Recursively collect files under `dir` (excluding tests and READMEs),
 * returning paths relative to `dir`.
 */
function collectComponentFiles(dir) {
  const out = [];
  function walk(current, relBase) {
    const entries = fs.readdirSync(current, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const rel = relBase ? path.join(relBase, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name.includes('.test.')) continue;
      if (entry.name === 'README.md') continue;
      out.push(rel);
    }
  }
  walk(dir, '');
  return out;
}

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

export function registerSwizzle(program) {
  program
    .command('swizzle [component]')
    .description('Copy component source for customization')
    .option('--output <dir>', 'Output directory', './components/xds')
    .option('--list', 'List available components')
    .option('--gap <reason>', 'File a gap report explaining why you swizzled')
    .option('--gap-category <category>', 'Gap category (for --gap mode)')
    .option('--no-report', 'Suppress the interactive gap report prompt')
    .action(async (component, options) => {
      const coreDir = findCoreDir(process.cwd());
      const json = program.opts().json || false;

      if (!coreDir) {
        if (json) return jsonError('Could not find @xds/core package');
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      const components = listComponents(coreDir);

      if (options.list || !component) {
        if (json) return jsonOut('swizzle.list', components);
        console.log('\nAvailable components:\n');
        for (const name of components) {
          console.log(`  ${name}`);
        }
        console.log(`\nUsage: xds swizzle <component>\n`);
        console.log('Example: xds swizzle Button');
        console.log('         xds swizzle XDSButton  (XDS prefix also works)\n');
        return;
      }

      const dirName = component.replace(/^XDS/, '');
      const componentDir = path.join(coreDir, 'src', dirName);

      if (!fs.existsSync(componentDir)) {
        if (json) return jsonError(`Component "${component}" not found`, components.slice(0, 5).map(n => ({name: n, reason: 'available component'})));
        console.error(`Error: Component "${component}" not found.`);
        console.error(`Available: ${components.join(', ')}`);
        process.exit(1);
      }

      const outputDir = path.resolve(process.cwd(), options.output, dirName);
      fs.mkdirSync(outputDir, {recursive: true});

      const exports = loadCoreExports(coreDir);
      const {rewrite, copies} = createImportRewriter({coreDir, exports});

      // Recursively copy all non-test, non-README files (preserves subdirs)
      const relPaths = collectComponentFiles(componentDir);
      let copied = 0;
      const copiedFiles = [];

      for (const rel of relPaths) {
        const srcPath = path.join(componentDir, rel);
        const destPath = path.join(outputDir, rel);

        let content = fs.readFileSync(srcPath, 'utf-8');

        if (/\.(ts|tsx|mts|cts)$/.test(rel)) {
          content = rewrite(content, srcPath, rel);
        }

        fs.mkdirSync(path.dirname(destPath), {recursive: true});
        fs.writeFileSync(destPath, content);
        copied++;
        copiedFiles.push(rel);
      }

      // Inline any internal helpers (transitive). Each inlined file
      // also gets its imports rewritten — including same-directory
      // './...' refs that point at sibling source files. New copies
      // are appended to the map. Bounded loop prevents runaway cycles.
      const processed = new Set();
      let safety = 0;
      while (safety++ < 50) {
        const pending = [...copies.entries()].filter(([abs]) => !processed.has(abs));
        if (pending.length === 0) break;
        for (const [absSource, outRel] of pending) {
          processed.add(absSource);
          if (!fs.existsSync(absSource)) continue;
          let content = fs.readFileSync(absSource, 'utf-8');
          if (/\.(ts|tsx|mts|cts)$/.test(absSource)) {
            content = rewrite(content, absSource, outRel, {processSameDir: true});
          }
          const dest = path.join(outputDir, outRel);
          fs.mkdirSync(path.dirname(dest), {recursive: true});
          fs.writeFileSync(dest, content);
          copied++;
          copiedFiles.push(outRel);
        }
      }

      const relOutput = path.relative(process.cwd(), outputDir);

      // --- Gap reporting ---

      const gapConfig = loadGapReportConfig();
      let gapReportUrl = null;

      if (options.gap) {
        if (gapConfig.enabled && (gapConfig.command || checkGhCli())) {
          const category = options.gapCategory || 'other';
          try {
            gapReportUrl = createGapReport({
              component: dirName,
              category,
              intention: options.gap,
              source: 'llm-auto',
            });
          } catch (err) {
            if (!json) console.error(`Warning: Could not file gap report: ${err.message}`);
          }
        }

        if (json) return jsonOut('swizzle.copy', {component: dirName, outputDir: relOutput, filesCopied: copied, files: copiedFiles, gapReport: gapReportUrl});
        console.log(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
        console.log('Relative imports have been rewritten to use @xds/core where possible.');
        console.log('Internal helpers (if any) were inlined under ' + INTERNAL_DIR + '/.\n');
        if (gapReportUrl) console.log(`✓ Gap report filed: ${gapReportUrl}\n`);
        else if (!gapConfig.enabled) console.log('Gap reporting is disabled via configuration.');
        else if (!gapConfig.command && !checkGhCli()) console.log('Skipping gap report: gh CLI not available.');
        return;
      }

      if (json) return jsonOut('swizzle.copy', {component: dirName, outputDir: relOutput, filesCopied: copied, files: copiedFiles});

      console.log(`\n✓ Copied ${copied} files to ${relOutput}/\n`);
      console.log('Relative imports have been rewritten to use @xds/core where possible.');
      console.log('Internal helpers (if any) were inlined under ' + INTERNAL_DIR + '/.\n');

      if (!options.report || !gapConfig.enabled) {
        return;
      }

      // Interactive gap report prompt
      if (!gapConfig.command && !checkGhCli()) {
        // Silently skip if gh isn't available and no custom command configured
        return;
      }

      const shouldReport = isCancel(
        await p.confirm({
          message: 'Would you like to report why you swizzled this component?',
          initialValue: false,
        }),
      );

      if (!shouldReport) return;

      const category = isCancel(
        await p.select({
          message: 'What kind of gap is this?',
          options: GAP_CATEGORIES,
        }),
      );

      const intention = isCancel(
        await p.text({
          message: 'What were you trying to achieve?',
          placeholder:
            'e.g. "Need a compact variant for use in dense data tables"',
          validate: val => {
            if (!val.trim()) return 'Please describe what you were trying to do';
          },
        }),
      );

      const detail = isCancel(
        await p.text({
          message: 'Any additional context? (optional)',
          placeholder: 'Press Enter to skip',
        }),
      );

      const s = p.spinner();
      s.start('Filing gap report');

      try {
        const url = createGapReport({
          component: dirName,
          category,
          intention: intention.trim(),
          detail: detail?.trim() || undefined,
          source: 'interactive',
        });
        s.stop('Gap report filed');
        console.log(`✓ ${url}\n`);
      } catch (err) {
        s.stop('Failed to file gap report');
        console.error(`Warning: Could not file gap report: ${err.message}`);
      }
    });
}
