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
import {join} from 'node:path';
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
                // {...rest} — keys unknown at parse time.
                site.isOpaque = true;
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

  it('marks a spread props bag opaque rather than guessing its keys', () => {
    const [site] = extractThemeTargets(`themeProps('card', {...rest})`);
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
  docBlocks: {key: 'docs' | 'docsZh'; targets: DocTarget[]}[];
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

    // Match the on-disk listing rather than existsSync: on case-insensitive
    // filesystems existsSync would match a differently-cased doc file that CI
    // never checks. (Same guard as derivedVarRegistry.test.ts.)
    if (!dirEntries.includes(`${dir}.doc.mjs`)) {
      continue;
    }

    let mod: ComponentDocModule;
    try {
      mod = require(join(dirPath, `${dir}.doc.mjs`)) as ComponentDocModule;
    } catch {
      continue;
    }

    const docBlocks: ComponentInfo['docBlocks'] = [];
    for (const key of ['docs', 'docsZh'] as const) {
      const targets = mod[key]?.theming?.targets;
      // Only blocks that already document a theming surface are held to it —
      // a doc with no theming block at all is a separate (documentation) gap.
      if (targets != null) {
        docBlocks.push({key, targets});
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

    for (const {key, targets} of docBlocks) {
      const documented = new Set(targets.map(t => t.className));

      it(`${dir} (${key}): every rendered class is documented`, () => {
        const undocumented = renderedClasses.filter(c => !documented.has(c));
        expect(
          undocumented,
          `${dir} renders ${undocumented.length} astryx-* class(es) that ` +
            `${dir}.doc.mjs ${key}.theming.targets does not document: ` +
            `${undocumented.join(', ')}. An undocumented class is an ` +
            `unthemeable element — theme authors and codegen read targets[] ` +
            `to learn which selectors exist. Add {className: '...'} entries.`,
        ).toEqual([]);
      });

      it(`${dir} (${key}): every visual prop passed to themeProps is documented`, () => {
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
          `${dir} passes prop keys to themeProps() that ${dir}.doc.mjs ` +
            `${key}.theming.targets does not list under visualProps/states. ` +
            `Each one is a [data-*] selector consumers cannot discover.`,
        ).toEqual([]);
      });
    }
  }
});
