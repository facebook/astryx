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
 * learn which selectors exist; an undocumented class is an unthemeable element,
 * and a documented class nothing renders is a selector that silently matches
 * nothing in a theme author's CSS.
 *
 * SCOPE — the `docs` block is checked PACKAGE-WIDE, across `@astryxdesign/core`
 * and `@astryxdesign/lab`. Package-wide rather than per-directory because a
 * class is legitimately rendered in one directory and documented in another:
 * `Code/` and `Heading/` ship no doc of their own (CodeBlock and Text document
 * them), and `hooks/useInputStatusIcon` renders `astryx-input-status-icon`,
 * which Field documents. Across both packages because `packages/lab` renders 10
 * targets of its own and was never scanned.
 *
 * The `docsZh` block stays a PER-DIRECTORY check: only some components carry a
 * zh translation, so a package-wide set would report every untranslated
 * component as drift. Its job here is translation parity for the directories
 * that do have one.
 *
 * POLICY, per direction:
 * - Rendered ⊆ documented — every class `themeProps()` renders must appear in
 *   some `theming.targets[]`, and every prop key passed to it must appear in
 *   that target's `visualProps` or `states`. Docs may list MORE keys than the
 *   source passes: components forward props they don't themselves reflect
 *   (Timestamp passes `{format}` but documents `type`/`color`/`format`), and
 *   that is intentional.
 * - Documented ⊆ rendered — every documented `className` must be rendered by a
 *   real `themeProps()` call somewhere in the package. This direction was
 *   unguarded and sat at exactly one violation (`astryx-more-menu`, which built
 *   its class through `stableClassName()` instead); it is pinned at zero here
 *   while it is cheap to hold.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import ts from 'typescript';
import {stableClassName} from '../naming';

const SRC_DIR = join(__dirname, '..');

/** The published packages whose `themeProps()` surface this file guards. */
const PACKAGES = [
  {name: '@astryxdesign/core', src: SRC_DIR},
  {name: '@astryxdesign/lab', src: resolve(__dirname, '../../../lab/src')},
];

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
// Discovery
// ---------------------------------------------------------------------------

interface DocTarget {
  className: string;
  visualProps?: string[];
  states?: string[];
}

type DocBlock = {theming?: {targets?: DocTarget[]}};
type ComponentDocModule = {docs?: DocBlock; docsZh?: DocBlock};

/** A themeProps() call site, tagged with the file it came from. */
interface PackageSite extends ThemeTargetSite {
  /** Path relative to the package src root, for failure messages. */
  file: string;
}

/** Every documented target for one className, unioned across the package. */
interface PackageTarget {
  keys: Set<string>;
  /** Doc files (package-relative) that declare this className. */
  files: Set<string>;
}

interface PackageInfo {
  name: string;
  sites: PackageSite[];
  targets: Map<string, PackageTarget>;
}

/**
 * Walk a package `src/` collecting source files and doc files. Recursive: doc
 * files do not all sit one level down (`Table/plugins/*.doc.mjs`), and neither
 * do the components that render targets.
 */
function walkPackage(dir: string): {sources: string[]; docs: string[]} {
  const sources: string[] = [];
  const docs: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') {
        continue;
      }
      const nested = walkPackage(full);
      sources.push(...nested.sources);
      docs.push(...nested.docs);
    } else if (entry.name.endsWith('.doc.mjs')) {
      docs.push(full);
    } else if (
      (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
      !entry.name.includes('.test.') &&
      !entry.name.endsWith('.d.ts')
    ) {
      sources.push(full);
    }
  }
  return {sources, docs};
}

function discoverPackage(name: string, src: string): PackageInfo {
  const {sources, docs} = walkPackage(src);

  const sites: PackageSite[] = [];
  for (const file of sources) {
    for (const site of extractThemeTargets(readFileSync(file, 'utf-8'), file)) {
      sites.push({...site, file: relative(src, file)});
    }
  }

  const targets = new Map<string, PackageTarget>();
  for (const file of docs) {
    let mod: ComponentDocModule;
    try {
      mod = require(file) as ComponentDocModule;
    } catch {
      continue;
    }
    for (const target of mod.docs?.theming?.targets ?? []) {
      if (typeof target?.className !== 'string') {
        continue;
      }
      const existing = targets.get(target.className) ?? {
        keys: new Set<string>(),
        files: new Set<string>(),
      };
      for (const key of [
        ...(target.visualProps ?? []),
        ...(target.states ?? []),
      ]) {
        existing.keys.add(key);
      }
      existing.files.add(relative(src, file));
      targets.set(target.className, existing);
    }
  }

  return {name, sites, targets};
}

// ---------------------------------------------------------------------------
// The guard — `docs`, package-wide, both directions
// ---------------------------------------------------------------------------

describe.each(PACKAGES)('$name theming.targets', ({name, src}) => {
  const pkg = discoverPackage(name, src);
  const rendered = new Map<string, PackageSite[]>();
  for (const site of pkg.sites) {
    const list = rendered.get(site.className) ?? [];
    list.push(site);
    rendered.set(site.className, list);
  }

  it('finds themeProps call sites and documented targets', () => {
    // A refactor that renames themeProps, or a package root that stops
    // resolving, must not silently disable this file.
    expect(pkg.sites.length).toBeGreaterThan(0);
    expect(pkg.targets.size).toBeGreaterThan(0);
  });

  it('every rendered class is documented', () => {
    const undocumented = [...rendered.entries()]
      .filter(([className]) => !pkg.targets.has(className))
      .map(([className, sites]) => `${className} (${sites[0].file})`)
      .sort();
    expect(
      undocumented,
      `${name} renders ${undocumented.length} astryx-* class(es) that no ` +
        `*.doc.mjs in the package documents under docs.theming.targets. An ` +
        `undocumented class is an unthemeable element — theme authors and ` +
        `codegen read targets[] to learn which selectors exist. Add ` +
        `{className: '...'} entries.`,
    ).toEqual([]);
  });

  it('every prop key passed to themeProps is documented', () => {
    const missing = new Set<string>();
    for (const site of pkg.sites) {
      const target = pkg.targets.get(site.className);
      if (target == null) {
        continue; // Reported by the class test above.
      }
      for (const propKey of site.propKeys) {
        if (!target.keys.has(propKey)) {
          missing.add(`${site.className}: ${propKey} (${site.file})`);
        }
      }
    }
    expect(
      [...missing].sort(),
      `${name} passes prop keys to themeProps() that no doc lists under the ` +
        `target's visualProps/states. Each one is a [data-*] selector ` +
        `consumers cannot discover.`,
    ).toEqual([]);
  });

  it('every documented target is actually rendered', () => {
    const unrendered = [...pkg.targets.entries()]
      .filter(([className]) => !rendered.has(className))
      .map(([className, target]) => `${className} (${[...target.files][0]})`)
      .sort();
    expect(
      unrendered,
      `${name} documents ${unrendered.length} theming target(s) that no ` +
        `themeProps() call renders. A documented selector nothing emits is ` +
        `worse than an undocumented one: a theme author writes CSS against ` +
        `it and it silently matches nothing. Either render the class through ` +
        `themeProps() or drop the targets[] entry. (Building the class by ` +
        `hand with stableClassName() does not count — that is how ` +
        `astryx-more-menu hid here.)`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// docsZh — per-directory translation parity, core only
// ---------------------------------------------------------------------------

interface ZhComponentInfo {
  dir: string;
  sites: ThemeTargetSite[];
  targets: DocTarget[];
}

function discoverZhComponents(): ZhComponentInfo[] {
  const results: ZhComponentInfo[] = [];
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

    // Only blocks that already document a theming surface are held to it — a
    // doc with no theming block at all is a separate (documentation) gap.
    const targets = mod.docsZh?.theming?.targets;
    if (targets == null) {
      continue;
    }

    results.push({dir, sites, targets});
  }
  return results;
}

describe('docsZh theming.targets matches the themeProps() call sites', () => {
  const components = discoverZhComponents();

  it('finds components to check', () => {
    expect(components.length).toBeGreaterThan(0);
  });

  for (const {dir, sites, targets} of components) {
    const renderedClasses = [...new Set(sites.map(s => s.className))].sort();
    const documented = new Set(targets.map(t => t.className));

    it(`${dir} (docsZh): every rendered class is documented`, () => {
      const undocumented = renderedClasses.filter(c => !documented.has(c));
      expect(
        undocumented,
        `${dir} renders ${undocumented.length} astryx-* class(es) that ` +
          `${dir}.doc.mjs docsZh.theming.targets does not document: ` +
          `${undocumented.join(', ')}. Keep the zh doc in step with the ` +
          `English one.`,
      ).toEqual([]);
    });

    it(`${dir} (docsZh): every visual prop passed to themeProps is documented`, () => {
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
          `docsZh.theming.targets does not list under visualProps/states.`,
      ).toEqual([]);
    });
  }
});
