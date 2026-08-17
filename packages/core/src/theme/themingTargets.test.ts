// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file Guards `theming.targets` against the real `themeProps()` call sites (#3741).
 * @input Component sources (*.tsx/*.ts) and their `{Name}.doc.mjs` files.
 * @output Vitest failures naming each undocumented class / visual prop.
 * @position Sibling of derivedVarRegistry.test.ts, which already validates the
 *   OTHER fields of the same `theming` block (`vars`, `derived`). `targets` was
 *   the one field with no machine check, so it drifted — twice (#3652, #3680).
 *
 * `theming.targets` is the documented CSS surface of a component: the stable
 * `astryx-*` classes it renders and the visual props it reflects as data
 * attributes. It is hand-authored, while the truth lives in `themeProps()`
 * calls in the source. Nothing kept the two in agreement.
 *
 * Drift is not cosmetic. `targets` is what theme authors and codegen read to
 * learn which selectors exist; an undocumented class is an unthemeable element.
 *
 * Policy is SUBSET, not equality: every class rendered by `themeProps()` must be
 * documented, and every prop key passed to it must appear in that target's
 * `visualProps` or `states`. Docs may list MORE than the source passes —
 * components forward props they don't themselves reflect (Timestamp passes
 * `{format}` but documents `type`/`color`/`format`), and that is intentional.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import ts from 'typescript';
import {stableClassName} from '../naming';

const SRC_DIR = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Source scanning: find themeProps() call sites via the TypeScript AST
// ---------------------------------------------------------------------------

interface ThemeTargetSite {
  /** Full stable class, e.g. 'astryx-progressbar-fill'. */
  className: string;
  /** Keys of the object literal passed as the 2nd arg (may be empty). */
  propKeys: string[];
  /** True when the 2nd arg exists but its keys can't be read statically. */
  isOpaque: boolean;
}

/**
 * Keys of a spread whose operand is a conditional object literal:
 * `...(cond && {a})`, `...(cond ? {a} : null)`, `...(cond || {a})`.
 * Returns null when the operand is anything else (a bag like `...rest`, or an
 * object with a computed key), which the caller treats as opaque.
 */
function conditionalSpreadKeys(expression: ts.Expression): string[] | null {
  const unwrap = (node: ts.Expression): ts.Expression =>
    ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node;

  const expr = unwrap(expression);
  const branches: ts.Expression[] = [];
  if (
    ts.isBinaryExpression(expr) &&
    (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      expr.operatorToken.kind === ts.SyntaxKind.BarBarToken)
  ) {
    branches.push(expr.right);
  } else if (ts.isConditionalExpression(expr)) {
    branches.push(expr.whenTrue, expr.whenFalse);
  } else if (ts.isObjectLiteralExpression(expr)) {
    branches.push(expr);
  } else {
    return null;
  }

  const keys: string[] = [];
  for (const branch of branches) {
    const object = unwrap(branch);
    // A falsy filler arm (`null`, `undefined`) contributes no keys; anything
    // else that is not an object literal hides its keys, so give up.
    if (
      object.kind === ts.SyntaxKind.NullKeyword ||
      (ts.isIdentifier(object) && object.text === 'undefined')
    ) {
      continue;
    }
    if (!ts.isObjectLiteralExpression(object)) {
      return null;
    }
    for (const prop of object.properties) {
      const name = prop.name;
      if (
        name != null &&
        (ts.isIdentifier(name) || ts.isStringLiteralLike(name))
      ) {
        keys.push(name.text);
      } else {
        return null;
      }
    }
  }
  return keys;
}

/**
 * Extract every `themeProps('name', {...})` call from a source file.
 *
 * Uses the AST rather than a regex because the call sites use every object
 * form: shorthand (`{variant}`), renamed (`{variant: fillVariant}` — the KEY is
 * the prop, not the value), and multi-line. A regex reading identifiers after
 * `:` would record `fillVariant`, a prop that does not exist.
 */
function extractThemeTargets(
  sourceText: string,
  fileName = 'source.tsx',
): ThemeTargetSite[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const sites: ThemeTargetSite[] = [];

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'themeProps'
    ) {
      const [nameArg, propsArg] = node.arguments;

      // Only string-literal component names are resolvable. A dynamic name
      // can't be checked statically; skip rather than guess.
      if (nameArg != null && ts.isStringLiteralLike(nameArg)) {
        const site: ThemeTargetSite = {
          className: stableClassName(nameArg.text),
          propKeys: [],
          isOpaque: false,
        };

        if (propsArg != null) {
          if (ts.isObjectLiteralExpression(propsArg)) {
            for (const prop of propsArg.properties) {
              if (ts.isSpreadAssignment(prop)) {
                // A conditional spread of an object literal — `...(type &&
                // {type})` — has statically known keys. Treating it as opaque
                // is how `astryx-heading`'s `type` stayed undocumented: the
                // same drift this file exists to catch (#3652, #3680).
                const spreadKeys = conditionalSpreadKeys(prop.expression);
                if (spreadKeys == null) {
                  site.isOpaque = true;
                } else {
                  site.propKeys.push(...spreadKeys);
                }
                continue;
              }
              const name = prop.name;
              if (name == null) {
                site.isOpaque = true;
                continue;
              }
              if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) {
                site.propKeys.push(name.text);
              } else {
                // Computed key: themeProps('x', {[k]: v})
                site.isOpaque = true;
              }
            }
          } else {
            // A variable or call passed as the props bag.
            site.isOpaque = true;
          }
        }

        sites.push(site);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return sites;
}

// ---------------------------------------------------------------------------
// The extractor must be right before its verdicts mean anything.
// ---------------------------------------------------------------------------

describe('extractThemeTargets', () => {
  it('reads a bare call with no props', () => {
    expect(extractThemeTargets(`themeProps('progressbar-track')`)).toEqual([
      {className: 'astryx-progressbar-track', propKeys: [], isOpaque: false},
    ]);
  });

  it('reads shorthand props', () => {
    expect(extractThemeTargets(`themeProps('progressbar', {variant})`)).toEqual(
      [
        {
          className: 'astryx-progressbar',
          propKeys: ['variant'],
          isOpaque: false,
        },
      ],
    );
  });

  it('records the KEY, not the value, when a prop is renamed', () => {
    // The trap a regex falls into: `fillVariant` is a local, not a prop.
    expect(
      extractThemeTargets(
        `themeProps('progressbar-fill', {variant: fillVariant})`,
      ),
    ).toEqual([
      {
        className: 'astryx-progressbar-fill',
        propKeys: ['variant'],
        isOpaque: false,
      },
    ]);
  });

  it('reads multi-line object literals', () => {
    const src = `
      const p = themeProps('outline', {
        variant,
        size: resolvedSize,
      });
    `;
    expect(extractThemeTargets(src)).toEqual([
      {
        className: 'astryx-outline',
        propKeys: ['variant', 'size'],
        isOpaque: false,
      },
    ]);
  });

  it('reads a call whose result is immediately accessed', () => {
    // Table does `themeProps('table').className` — still a rendered class.
    expect(extractThemeTargets(`themeProps('table').className`)).toEqual([
      {className: 'astryx-table', propKeys: [], isOpaque: false},
    ]);
  });

  it('finds every call in a file', () => {
    const src = `
      <div {...themeProps('card', {variant})}>
        <span {...themeProps('card-header')} />
      </div>
    `;
    expect(extractThemeTargets(src).map(s => s.className)).toEqual([
      'astryx-card',
      'astryx-card-header',
    ]);
  });

  it('reads the keys of a conditional spread', () => {
    // Heading's real call site: `{level, color, ...(type && {type})}`.
    const [site] = extractThemeTargets(
      `themeProps('heading', {level, color, ...(type && {type})})`,
    );
    expect(site.propKeys).toEqual(['level', 'color', 'type']);
    expect(site.isOpaque).toBe(false);
  });

  it('reads both arms of a ternary spread', () => {
    const [site] = extractThemeTargets(
      `themeProps('card', {...(isOpen ? {expanded} : {collapsed})})`,
    );
    expect(site.propKeys).toEqual(['expanded', 'collapsed']);
    expect(site.isOpaque).toBe(false);
  });

  it('marks a spread props bag opaque rather than guessing its keys', () => {
    const [site] = extractThemeTargets(`themeProps('card', {...rest})`);
    expect(site.isOpaque).toBe(true);
    expect(site.propKeys).toEqual([]);
  });

  it('marks a conditional spread of a non-literal opaque', () => {
    const [site] = extractThemeTargets(`themeProps('card', {...(on && rest)})`);
    expect(site.isOpaque).toBe(true);
    expect(site.propKeys).toEqual([]);
  });

  it('marks a non-literal props bag opaque', () => {
    const [site] = extractThemeTargets(`themeProps('card', visualProps)`);
    expect(site.isOpaque).toBe(true);
  });

  it('ignores a dynamic component name it cannot resolve', () => {
    expect(extractThemeTargets(`themeProps(name, {variant})`)).toEqual([]);
  });

  it('ignores an unrelated function of a similar shape', () => {
    expect(extractThemeTargets(`stylex.props('card', {variant})`)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Discovery: every component dir's rendered classes vs its documented targets
// ---------------------------------------------------------------------------

interface DocTarget {
  className: string;
  visualProps?: string[];
  states?: string[];
}

type DocBlock = {theming?: {targets?: DocTarget[]}};
type ComponentDocModule = {docs?: DocBlock; docsZh?: DocBlock};

interface ComponentInfo {
  dir: string;
  sites: ThemeTargetSite[];
  /** The doc blocks that carry theming.targets, by the key they live under. */
  docBlocks: {key: 'docs' | 'docsZh'; file: string; targets: DocTarget[]}[];
}

/**
 * Every `*.doc.mjs` under src that declares a theming target for one of
 * `classNames`. Lets a component be checked against the doc that documents it,
 * wherever that file lives.
 *
 * Reads the file as text rather than requiring it: this runs for directories
 * that have no doc of their own, so most candidates are misses.
 */
function docFilesDocumenting(classNames: Set<string>): string[] {
  const matches: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p);
      } else if (entry.name.endsWith('.doc.mjs')) {
        const source = readFileSync(p, 'utf-8');
        for (const className of classNames) {
          if (source.includes(`'${className}'`)) {
            matches.push(p);
            break;
          }
        }
      }
    }
  };
  walk(SRC_DIR);
  return matches;
}

function discoverComponents(): ComponentInfo[] {
  const results: ComponentInfo[] = [];
  const dirs = readdirSync(SRC_DIR, {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    const dirPath = join(SRC_DIR, dir);
    const dirEntries = readdirSync(dirPath);

    const sourceFiles = dirEntries.filter(
      f =>
        (f.endsWith('.tsx') || f.endsWith('.ts')) &&
        !f.includes('.test.') &&
        !f.endsWith('.d.ts'),
    );

    const sites: ThemeTargetSite[] = [];
    for (const f of sourceFiles) {
      const filePath = join(dirPath, f);
      sites.push(
        ...extractThemeTargets(readFileSync(filePath, 'utf-8'), filePath),
      );
    }
    if (sites.length === 0) {
      continue;
    }

    // A component's doc file usually sits beside its source, but not always:
    // `Heading/Heading.tsx` is documented by `Text/Text.doc.mjs`. Requiring a
    // same-directory doc silently exempted every such component — Heading
    // among them. Fall back to whichever doc file documents the classes this
    // directory renders.
    //
    // Both paths match the on-disk listing rather than existsSync: on
    // case-insensitive filesystems existsSync would match a differently-cased
    // doc file that CI never checks. (Same guard as derivedVarRegistry.test.ts.)
    const docFiles = dirEntries.includes(`${dir}.doc.mjs`)
      ? [join(dirPath, `${dir}.doc.mjs`)]
      : docFilesDocumenting(new Set(sites.map(s => s.className)));
    if (docFiles.length === 0) {
      continue;
    }

    const docBlocks: ComponentInfo['docBlocks'] = [];
    for (const docFile of docFiles) {
      let mod: ComponentDocModule;
      try {
        mod = require(docFile) as ComponentDocModule;
      } catch {
        continue;
      }
      for (const key of ['docs', 'docsZh'] as const) {
        const targets = mod[key]?.theming?.targets;
        // Only blocks that already document a theming surface are held to it —
        // a doc with no theming block at all is a separate (documentation) gap.
        if (targets != null) {
          docBlocks.push({key, file: relative(SRC_DIR, docFile), targets});
        }
      }
    }
    if (docBlocks.length === 0) {
      continue;
    }

    results.push({dir, sites, docBlocks});
  }
  return results;
}

// ---------------------------------------------------------------------------
// The guard
// ---------------------------------------------------------------------------

describe('theming.targets matches the themeProps() call sites', () => {
  const components = discoverComponents();

  it('finds components to check', () => {
    // A refactor that renames themeProps must not silently disable this file.
    expect(components.length).toBeGreaterThan(0);
  });

  for (const {dir, sites, docBlocks} of components) {
    const renderedClasses = [...new Set(sites.map(s => s.className))].sort();

    for (const {key, file, targets} of docBlocks) {
      const documented = new Set(targets.map(t => t.className));

      it(`${dir} (${file} ${key}): every rendered class is documented`, () => {
        const undocumented = renderedClasses.filter(c => !documented.has(c));
        expect(
          undocumented,
          `${dir} renders ${undocumented.length} astryx-* class(es) that ` +
            `${file} ${key}.theming.targets does not document: ` +
            `${undocumented.join(', ')}. An undocumented class is an ` +
            `unthemeable element — theme authors and codegen read targets[] ` +
            `to learn which selectors exist. Add {className: '...'} entries.`,
        ).toEqual([]);
      });

      it(`${dir} (${file} ${key}): every visual prop passed to themeProps is documented`, () => {
        const missing: string[] = [];
        for (const site of sites) {
          const target = targets.find(t => t.className === site.className);
          if (target == null) {
            continue; // Reported by the class test above.
          }
          const known = new Set([
            ...(target.visualProps || []),
            ...(target.states || []),
          ]);
          for (const propKey of site.propKeys) {
            if (!known.has(propKey)) {
              missing.push(`${site.className}: ${propKey}`);
            }
          }
        }
        expect(
          [...new Set(missing)],
          `${dir} passes prop keys to themeProps() that ${file} ` +
            `${key}.theming.targets does not list under visualProps/states. ` +
            `Each one is a [data-*] selector consumers cannot discover.`,
        ).toEqual([]);
      });
    }
  }
});
