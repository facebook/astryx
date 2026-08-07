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
 *
 * A third argument may carry `legacyNames: ['old-name']` (see
 * `ThemePropsOptions`): renamed targets whose old class is still emitted beside
 * the new one during a deprecation window. Those land on the SAME element with
 * the same data-* attributes, so each is reported as its own rendered site —
 * otherwise the documented ⊆ rendered direction would read a deliberately
 * documented deprecated target as unrendered.
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

        // `themeProps(name, props, {legacyNames: ['old']})` emits the old
        // class alongside the new one, on the same element and with the same
        // data-* attributes. Record each as a rendered site so a documented
        // deprecated target is not mistaken for a dead selector.
        const optionsArg = node.arguments[2];
        if (optionsArg != null && ts.isObjectLiteralExpression(optionsArg)) {
          for (const option of optionsArg.properties) {
            if (
              !ts.isPropertyAssignment(option) ||
              option.name == null ||
              !(
                ts.isIdentifier(option.name) ||
                ts.isStringLiteralLike(option.name)
              ) ||
              option.name.text !== 'legacyNames' ||
              !ts.isArrayLiteralExpression(option.initializer)
            ) {
              continue;
            }
            for (const element of option.initializer.elements) {
              // Non-literal entries can't be resolved statically; themeProps'
              // own docs ask call sites to pass plain string literals.
              if (ts.isStringLiteralLike(element)) {
                sites.push({
                  className: stableClassName(element.text),
                  propKeys: [...site.propKeys],
                  isOpaque: site.isOpaque,
                });
              }
            }
          }
        }
      }
    }

    // `usePopover({surfaceTarget: 'x'})` puts `astryx-x` on the popup surface
    // usePopover owns — an element the component cannot render itself, so the
    // literal is the only trace of it (#5009). The CLI's sibling guard reads
    // it the same way.
    if (
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) &&
      node.name.text === 'surfaceTarget' &&
      ts.isStringLiteralLike(node.initializer)
    ) {
      sites.push({
        className: stableClassName(node.initializer.text),
        propKeys: [],
        isOpaque: false,
      });
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

  it('records a surfaceTarget literal as a rendered site', () => {
    expect(
      extractThemeTargets(`usePopover({role: 'none', surfaceTarget: 'x'})`),
    ).toEqual([{className: 'astryx-x', propKeys: [], isOpaque: false}]);
  });

  it('records a legacyNames entry as its own rendered site', () => {
    // The class is emitted beside the new one on the same element, carrying
    // the same data-* attributes — so it inherits the prop keys.
    expect(
      extractThemeTargets(
        `themeProps('radio-indicator', {size}, {legacyNames: ['radio']})`,
      ),
    ).toEqual([
      {
        className: 'astryx-radio-indicator',
        propKeys: ['size'],
        isOpaque: false,
      },
      {className: 'astryx-radio', propKeys: ['size'], isOpaque: false},
    ]);
  });

  it('ignores a legacyNames entry it cannot resolve statically', () => {
    expect(
      extractThemeTargets(
        `themeProps('radio-indicator', {}, {legacyNames: [OLD_NAME]})`,
      ).map(s => s.className),
    ).toEqual(['astryx-radio-indicator']);
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
  /** The doc file carrying the zh block, relative to the package src root. */
  file: string;
  sites: ThemeTargetSite[];
  targets: DocTarget[];
}

/**
 * Every `*.doc.mjs` under core src that declares a theming target for one of
 * `classNames`. Lets a component be checked against the doc that documents it,
 * wherever that file lives: `Heading/Heading.tsx` is documented by
 * `Text/Text.doc.mjs`, and requiring a same-directory doc silently exempted
 * every such component.
 *
 * Reads the file as text rather than requiring it: this runs for directories
 * that have no doc of their own, so most candidates are misses.
 */
function docFilesDocumenting(classNames: Set<string>): string[] {
  return walkPackage(SRC_DIR).docs.filter(file => {
    const source = readFileSync(file, 'utf-8');
    for (const className of classNames) {
      if (source.includes(`'${className}'`)) {
        return true;
      }
    }
    return false;
  });
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
    const docFiles = dirEntries.includes(`${dir}.doc.mjs`)
      ? [join(dirPath, `${dir}.doc.mjs`)]
      : docFilesDocumenting(new Set(sites.map(s => s.className)));

    for (const docFile of docFiles) {
      let mod: ComponentDocModule;
      try {
        mod = require(docFile) as ComponentDocModule;
      } catch {
        continue;
      }

      // Only blocks that already document a theming surface are held to it — a
      // doc with no theming block at all is a separate (documentation) gap.
      const targets = mod.docsZh?.theming?.targets;
      if (targets == null) {
        continue;
      }

      results.push({dir, file: relative(SRC_DIR, docFile), sites, targets});
    }
  }
  return results;
}

describe('docsZh theming.targets matches the themeProps() call sites', () => {
  const components = discoverZhComponents();

  it('finds components to check', () => {
    expect(components.length).toBeGreaterThan(0);
  });

  for (const {dir, file, sites, targets} of components) {
    const renderedClasses = [...new Set(sites.map(s => s.className))].sort();
    const documented = new Set(targets.map(t => t.className));

    it(`${dir} (${file} docsZh): every rendered class is documented`, () => {
      const undocumented = renderedClasses.filter(c => !documented.has(c));
      expect(
        undocumented,
        `${dir} renders ${undocumented.length} astryx-* class(es) that ` +
          `${file} docsZh.theming.targets does not document: ` +
          `${undocumented.join(', ')}. Keep the zh doc in step with the ` +
          `English one.`,
      ).toEqual([]);
    });

    it(`${dir} (${file} docsZh): every visual prop passed to themeProps is documented`, () => {
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
          `docsZh.theming.targets does not list under visualProps/states.`,
      ).toEqual([]);
    });
  }
});
