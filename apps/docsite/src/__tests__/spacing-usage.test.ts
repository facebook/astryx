// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Spacing token usage derivation tests for the Theme Editor.
 *
 * Covers the pipeline that answers "if I change --spacing-N, what moves?"
 * (issue #808). The map is derived from packages/core source rather than
 * hand-curated, because a hand-authored component→token map in this repo has
 * already drifted twice (see packages/core/src/theme/themingTargets.test.ts).
 *
 * The logic lives in src/lib/spacingUsage.mjs (shared with
 * scripts/generate-spacing-usage.mjs), so these tests exercise the same code
 * path the build-time generator uses.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, beforeAll, describe, it, expect} from 'vitest';
import {spacingDefaults} from '@astryxdesign/core/theme';
import * as spacingUsageLib from '../lib/spacingUsage.mjs';
import {analyzeSource, deriveSpacingUsage} from '../lib/spacingUsage.mjs';
import {summarizeSpacingUsage} from '../app/playground/themeEditor/helpers';

const CORE_SRC_DIR = path.resolve(__dirname, '../../../../packages/core/src');

describe('analyzeSource', () => {
  it('records a spacing token used in a named style entry', () => {
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      'const styles = stylex.create({',
      '  base: {',
      "    gap: spacingVars['--spacing-2'],",
      '  },',
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Button/Button.tsx');

    expect(result.local).toEqual([
      {token: '--spacing-2', property: 'gap', scale: false},
    ]);
  });

  it('marks numerically keyed style entries as prop-driven scale rungs', () => {
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      'const gapStyles = stylex.create({',
      '  2: {',
      "    columnGap: spacingVars['--spacing-2'],",
      '  },',
      '  0.5: {',
      "    columnGap: spacingVars['--spacing-0-5'],",
      '  },',
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Stack/stack.stylex.ts');

    expect(result.local).toEqual([
      {token: '--spacing-2', property: 'columnGap', scale: true},
      {token: '--spacing-0-5', property: 'columnGap', scale: true},
    ]);
  });

  it('treats SpacingToken-keyed entries as scale rungs too', () => {
    // container.stylex.ts spells the same prop-keyed scale with the
    // SpacingToken union ('spacing4') rather than a numeric literal (4).
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      'const styles = stylex.create({',
      "  spacing4: {'--container-padding': spacingVars['--spacing-4']},",
      "  spacing0_5: {'--container-padding': spacingVars['--spacing-0-5']},",
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Layout/container.stylex.ts');

    expect(result.local).toEqual([
      {token: '--spacing-4', property: '--container-padding', scale: true},
      {token: '--spacing-0-5', property: '--container-padding', scale: true},
    ]);
  });

  it('resolves a token named as a string and indexed indirectly', () => {
    // Toolbar and Grid map a SpacingStep prop to a token name, then index
    // spacingVars with it. The numeric keys still mark it as a scale.
    const source = [
      "import {spacingVars} from '../theme/tokens.stylex';",
      'const spacingStepToVar = {',
      "  2: '--spacing-2',",
      "  0.5: '--spacing-0-5',",
      '};',
    ].join('\n');

    const result = analyzeSource(source, 'Toolbar/Toolbar.tsx');

    expect(result.local).toEqual([
      {token: '--spacing-2', property: '2', scale: true},
      {token: '--spacing-0-5', property: '0.5', scale: true},
    ]);
  });

  it('does not mistake a token default table for token usage', () => {
    // theme/tokens.stylex.ts declares the scale itself: token names are keys
    // and the values are lengths, so nothing here is a usage site.
    const source = [
      'export const spacingDefaults = {',
      "  '--spacing-4': '16px',",
      "  '--spacing-6': '24px',",
      '} as const;',
    ].join('\n');

    const result = analyzeSource(source, 'theme/tokens.stylex.ts');

    expect(result.local).toEqual([]);
    expect(result.exports.get('spacingDefaults')).toBeUndefined();
  });

  it('ignores tokens that appear only in comments', () => {
    // The map is read off the AST, not grepped: commented-out usage is trivia.
    const source = [
      "import {spacingVars} from '../theme/tokens.stylex';",
      "// gap: spacingVars['--spacing-2'] — removed with the compact variant",
      'const styles = {};',
    ].join('\n');

    const result = analyzeSource(source, 'Button/Button.tsx');

    expect(result.local).toEqual([]);
  });

  it('resolves a spacing token reached through a const alias', () => {
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      "const SP4 = spacingVars['--spacing-4'];",
      'const styles = stylex.create({',
      '  base: {',
      '    padding: SP4,',
      '  },',
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Layout/container.stylex.ts');

    expect(result.local).toEqual([
      {token: '--spacing-4', property: 'padding', scale: false},
    ]);
  });

  it('follows a chained var() fallback built from template literals', () => {
    // The shape Card/Section/Dialog default padding actually uses.
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      "const SP4 = spacingVars['--spacing-4'];",
      'const cardShorthand = `var(--astryx-card-padding, ${SP4})`;',
      'const cardInline = `var(--astryx-card-padding-inline, ${cardShorthand})`;',
      'const styles = stylex.create({',
      '  base: {',
      '    paddingInline: cardInline,',
      '  },',
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Layout/container.stylex.ts');

    // ownerVar carries the public custom property the value flows through, so
    // the declaration can be credited to Card rather than to the Layout
    // directory that happens to host the chain.
    expect(result.local).toEqual([
      {
        token: '--spacing-4',
        property: 'paddingInline',
        scale: false,
        ownerVar: 'card-padding-inline',
      },
    ]);
  });

  it('separates exported style objects from module-local ones', () => {
    const source = [
      "import * as stylex from '@stylexjs/stylex';",
      "import {spacingVars} from '../theme/tokens.stylex';",
      'export const inputWrapperStyles = stylex.create({',
      "  base: {paddingBlock: spacingVars['--spacing-1']},",
      '});',
      'const privateStyles = stylex.create({',
      "  base: {gap: spacingVars['--spacing-6']},",
      '});',
    ].join('\n');

    const result = analyzeSource(source, 'Field/inputStyles.stylex.ts');

    expect(result.exports.get('inputWrapperStyles')).toEqual([
      {token: '--spacing-1', property: 'paddingBlock', scale: false},
    ]);
    expect(result.local).toEqual([
      {token: '--spacing-6', property: 'gap', scale: false},
    ]);
  });

  it('collects named imports and barrel re-exports by source module', () => {
    const source = [
      "import {inputWrapperStyles} from '../Field';",
      "import {container} from '../Layout/container.stylex';",
      "export {inputWrapperStyles} from './inputStyles.stylex';",
      "export type {InputStatus} from './inputStyles.stylex';",
    ].join('\n');

    const result = analyzeSource(source, 'TextInput/TextInput.tsx');

    expect(result.imports).toEqual([
      {from: '../Field', names: ['inputWrapperStyles']},
      {from: '../Layout/container.stylex', names: ['container']},
    ]);
    expect(result.reexports).toEqual([
      {
        from: './inputStyles.stylex',
        names: ['inputWrapperStyles'],
        sources: ['inputWrapperStyles'],
      },
    ]);
  });

  it('records the source-side name for aliased imports and re-exports', () => {
    // A rename anywhere in the chain must not silently zero attribution: the
    // lookup that follows the graph runs on source-side names.
    const source = [
      "import {shared as mine} from '../Shared/styles';",
      "export {innerStyles as outerStyles} from './inner';",
    ].join('\n');

    const result = analyzeSource(source, 'AliasImp/AliasImp.tsx');

    expect(result.imports).toEqual([
      {from: '../Shared/styles', names: ['shared']},
    ]);
    expect(result.reexports).toEqual([
      {from: './inner', names: ['outerStyles'], sources: ['innerStyles']},
    ]);
  });

  it('ignores type-only imports', () => {
    const source = [
      "import type {SpacingToken} from '../Layout/container.stylex';",
      "import {type SpacingStep, container} from '../Layout/container.stylex';",
    ].join('\n');

    const result = analyzeSource(source, 'Card/Card.tsx');

    expect(result.imports).toEqual([
      {from: '../Layout/container.stylex', names: ['container']},
    ]);
  });
});

describe('summarizeSpacingUsage', () => {
  it('lists the first few components and counts the rest', () => {
    const result = summarizeSpacingUsage({
      components: ['Badge', 'Banner', 'Button', 'Chat', 'Item'],
      viaProps: [],
    });

    expect(result?.summary).toBe('Badge, Banner, Button +2 more');
    expect(result?.detail).toBe(
      'Moves 5 components by default: Badge, Banner, Button, Chat, Item.',
    );
  });

  it('omits the counter when everything fits', () => {
    const result = summarizeSpacingUsage({
      components: ['Badge', 'Button'],
      viaProps: [],
    });

    expect(result?.summary).toBe('Badge, Button');
  });

  it('omits the counter when the list exactly fills the cap', () => {
    const result = summarizeSpacingUsage({
      components: ['Badge', 'Button', 'Card'],
      viaProps: [],
    });

    expect(result?.summary).toBe('Badge, Button, Card');
  });

  it('says so when a token has no default usage at all', () => {
    // --spacing-9 and --spacing-10 are reachable only through a numeric
    // spacing prop. Reporting "no components" would be wrong; merging them
    // into one count would be misleading.
    const result = summarizeSpacingUsage({
      components: [],
      viaProps: ['Grid', 'Stack'],
    });

    expect(result?.summary).toBe('Only via spacing props');
    // The full pin also guards the phrasing: with zero default consumers there
    // is no "more" for the prop-driven count to be more than.
    expect(result?.detail).toBe(
      'No component uses this step by default.\n\n' +
        'Reachable on 2 components when a spacing prop selects it: Grid, Stack.',
    );
  });

  it('keeps prop-driven components out of the default count', () => {
    const result = summarizeSpacingUsage({
      components: ['Button'],
      viaProps: ['Grid', 'Stack'],
    });

    expect(result?.detail).toContain('Moves 1 component by default: Button.');
    expect(result?.detail).toContain(
      'Reachable on 2 more components when a spacing prop selects it: Grid, Stack.',
    );
  });

  it('renders nothing for a token with no mapping', () => {
    // SpacingEditor also serves the size group, whose tokens are unmapped.
    expect(summarizeSpacingUsage(undefined)).toBeNull();
    expect(summarizeSpacingUsage({components: [], viaProps: []})).toBeNull();
  });
});

describe('deriveSpacingUsage (against packages/core source)', () => {
  const usage = deriveSpacingUsage(CORE_SRC_DIR);

  it('covers every spacing rung defined in the theme, exactly', () => {
    // Keyed to the live theme, so a new rung that the derivation misses (or a
    // rung the derivation loses) fails here instead of rendering a silently
    // blank row in the editor.
    expect(Object.keys(usage).sort()).toEqual(
      Object.keys(spacingDefaults).sort(),
    );
  });

  it('derives identically from a relative source dir', () => {
    // Regression: an unresolved relative dir once made every import lookup
    // miss and silently under-report shared-style attribution.
    const relative = path.relative(process.cwd(), CORE_SRC_DIR);
    expect(deriveSpacingUsage(relative)).toEqual(usage);
  });

  it('fails loudly when the source dir does not exist', () => {
    expect(() =>
      deriveSpacingUsage('/nonexistent/packages/core/src'),
    ).toThrow();
  });

  it('answers the high rungs with prop-only reach, from live data', () => {
    // --spacing-9 and --spacing-10 exist only as prop-scale rungs. The editor
    // phrasing for that case must hold against the derivation, not a fixture.
    for (const token of ['--spacing-9', '--spacing-10']) {
      expect(usage[token].components, token).toEqual([]);
      expect(usage[token].viaProps.length, token).toBeGreaterThan(0);
      expect(summarizeSpacingUsage(usage[token])?.summary, token).toBe(
        'Only via spacing props',
      );
    }
  });

  it('names every component directory that references spacing tokens', () => {
    // The inverse of the derivation: a raw text search over component sources
    // must not find a component the map failed to attribute anywhere. This is
    // the net for the silent under-report class (unresolved imports, future
    // source spellings) — checked at component level, so ownerVar redirection
    // (Layout hosting Card's chain) cannot false-alarm.
    const named = new Set(
      Object.values(usage).flatMap(entry => [
        ...entry.components,
        ...entry.viaProps,
      ]),
    );
    const referencingDirs = new Set<string>();
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (
            !['__snapshots__', '__tests__', 'node_modules'].includes(entry.name)
          ) {
            walk(full);
          }
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) {
          continue;
        }
        if (
          /\.(test|test-violations|stories|doc|bench)\.[cm]?[jt]sx?$/.test(
            entry.name,
          )
        ) {
          continue;
        }
        if (!/spacingVars\['--spacing-/.test(fs.readFileSync(full, 'utf-8'))) {
          continue;
        }
        const top = path.relative(CORE_SRC_DIR, full).split(path.sep)[0];
        // Only dirs that hold an actual component file: a PascalCase dir
        // without one (NavItem) is shared styling whose refs are correctly
        // attributed to the components that apply it.
        if (
          /^[A-Z]/.test(top) &&
          fs.existsSync(path.join(CORE_SRC_DIR, top, `${top}.tsx`))
        ) {
          referencingDirs.add(top);
        }
      }
    };
    walk(CORE_SRC_DIR);
    expect(referencingDirs.size).toBeGreaterThan(0);
    for (const dir of referencingDirs) {
      expect(named.has(dir), dir).toBe(true);
    }
  });

  it('lists Button as a default consumer of its own padding tokens', () => {
    expect(usage['--spacing-2'].components).toContain('Button');
    expect(usage['--spacing-3'].components).toContain('Button');
  });

  it('classifies Stack gap as prop-driven, not a default consumer', () => {
    expect(usage['--spacing-2'].viaProps).toContain('Stack');
    expect(usage['--spacing-2'].components).not.toContain('Stack');
  });

  it('attributes Card default padding to --spacing-4 through the var() chain', () => {
    expect(usage['--spacing-4'].components).toContain('Card');
  });

  it('attributes shared input styles to the components that apply them', () => {
    // inputWrapperStyles is declared in Field/ but re-exported through the
    // Field barrel and applied by five separate input components.
    expect(usage['--spacing-1'].components).toContain('TextInput');
    expect(usage['--spacing-2'].components).toContain('TextInput');
    expect(usage['--spacing-1'].components).toContain('Tokenizer');
  });

  it('credits hook-rendered spacing to the components that mount the hook', () => {
    // useKeyboardHint (hooks/, not a component dir) renders its own styled
    // markup; its module-level spacing must flow to the mounting components,
    // not silently vanish because hooks/ names no component.
    for (const name of ['Toolbar', 'TabList', 'SegmentedControl']) {
      expect(usage['--spacing-1'].components, name).toContain(name);
      expect(usage['--spacing-2'].components, name).toContain(name);
    }
    // useEntryAnimation flows the same way to FieldStatus.
    expect(usage['--spacing-2'].components).toContain('FieldStatus');
  });

  it('does not report Layout as a default consumer of every rung', () => {
    // Layout enumerates the whole scale for its numeric padding prop; that is
    // reach, not default usage. Without the scale filter it would appear under
    // all 15 rungs and the annotation would be noise.
    const defaultRungs = Object.keys(usage).filter(token =>
      usage[token].components.includes('Layout'),
    );
    expect(defaultRungs.length).toBeLessThan(15);
    expect(usage['--spacing-9'].components).not.toContain('Layout');
  });

  it('never reports a component that does not exist', () => {
    // The issue's proposed table credits a "Container" component for spacing-3
    // and spacing-4 padding. No such component exists — Container is an
    // internal StyleX util plus an anatomy label in Card.doc.mjs.
    const named = new Set(
      Object.values(usage).flatMap(entry => [
        ...entry.components,
        ...entry.viaProps,
      ]),
    );
    expect(named.has('Container')).toBe(false);
  });

  it("pins Field's own gap to --spacing-1, not --spacing-2", () => {
    // The issue's table lists "Field gap" under both --spacing-1 and
    // --spacing-2. Field.tsx uses --spacing-1; the --spacing-2 gap belongs to
    // the input wrapper, a different element.
    expect(usage['--spacing-1'].components).toContain('Field');

    // And credit follows what a component *applies*, not what its directory
    // happens to contain: inputWrapperStyles is declared in Field/ but applied
    // by the five input components, so they carry its --spacing-2 and Field
    // does not.
    for (const name of [
      'TextInput',
      'Selector',
      'Tokenizer',
      'Typeahead',
      'TimeInput',
    ]) {
      expect(usage['--spacing-2'].components, name).toContain(name);
    }
    expect(usage['--spacing-2'].components).not.toContain('Field');
  });

  it('pins Section default padding to --spacing-4, not --spacing-6', () => {
    // The issue's table claims --spacing-6 drives "Section spacing". Section's
    // padding chain terminates at --spacing-4.
    expect(usage['--spacing-4'].components).toContain('Section');
    expect(usage['--spacing-6'].components).not.toContain('Section');
  });

  it('returns component lists that are sorted and free of duplicates', () => {
    for (const [token, entry] of Object.entries(usage)) {
      expect(entry.components, token).toEqual([...new Set(entry.components)]);
      expect(entry.components, token).toEqual([...entry.components].sort());
      expect(entry.viaProps, token).toEqual([...entry.viaProps].sort());
    }
  });

  it('never lists a component as both a default and a prop-driven consumer', () => {
    // A component whose fixed styles already use the token is moved by any
    // change to it; reporting it a second time as conditional is misleading.
    for (const [token, entry] of Object.entries(usage)) {
      const overlap = entry.viaProps.filter(name =>
        entry.components.includes(name),
      );
      expect(overlap, token).toEqual([]);
    }
  });
});

describe('deriveSpacingUsage (synthetic fixtures)', () => {
  let fixtureDir: string;

  const write = (relative: string, lines: string[]) => {
    const full = path.join(fixtureDir, relative);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, lines.join('\n'));
  };

  beforeAll(() => {
    fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spacing-usage-'));
    write('Shared/styles.ts', [
      "import {spacingVars} from '../theme/tokens.stylex';",
      'export const shared = {',
      "  base: {gap: spacingVars['--spacing-1']},",
      '};',
    ]);
    write('AliasImp/AliasImp.tsx', [
      "import {shared as mine} from '../Shared/styles';",
    ]);
    write('Barrel/inner.ts', [
      "import {spacingVars} from '../theme/tokens.stylex';",
      'export const innerStyles = {',
      "  base: {padding: spacingVars['--spacing-3']},",
      '};',
    ]);
    write('Barrel/index.ts', [
      "export {innerStyles as outerStyles} from './inner';",
    ]);
    write('BarrelUser/BarrelUser.tsx', [
      "import {outerStyles} from '../Barrel';",
    ]);
    write('hooks/useThing.ts', [
      "import {spacingVars} from '../theme/tokens.stylex';",
      'const styles = {',
      "  hint: {gap: spacingVars['--spacing-5']},",
      '};',
      'export function useThing() {',
      '  return styles;',
      '}',
    ]);
    write('HookUser/HookUser.tsx', [
      "import {useThing} from '../hooks/useThing';",
    ]);
    write('Rooty.tsx', [
      "import {spacingVars} from './theme/tokens.stylex';",
      'const styles = {',
      "  base: {margin: spacingVars['--spacing-12']},",
      '};',
    ]);
  });

  afterAll(() => {
    fs.rmSync(fixtureDir, {recursive: true, force: true});
  });

  it('follows aliased imports, aliased re-exports, and hook modules', () => {
    expect(deriveSpacingUsage(fixtureDir)).toEqual({
      // import {shared as mine} still attributes the source binding.
      '--spacing-1': {components: ['AliasImp'], viaProps: []},
      // export {innerStyles as outerStyles} resolves through the rename.
      '--spacing-3': {components: ['BarrelUser'], viaProps: []},
      // hooks/ names no component, so its refs flow to the mounting file.
      '--spacing-5': {components: ['HookUser'], viaProps: []},
      // Rooty.tsx at the root is a file, not a component dir: no phantom
      // "Rooty.tsx" entry may appear for --spacing-12.
    });
  });
});

describe('renderSpacingUsageModule', () => {
  it('emits the generated module text for a map', () => {
    const output = spacingUsageLib.renderSpacingUsageModule({
      '--spacing-1': {components: ['Badge'], viaProps: []},
      '--spacing-2': {components: ['Button', 'Card'], viaProps: ['Stack']},
    });

    expect(output).toContain(
      '@generated by scripts/generate-spacing-usage.mjs',
    );
    expect(output).toContain('export interface SpacingUsage {');
    expect(output).toContain(
      'export const spacingUsage: Record<string, SpacingUsage> = {',
    );
    expect(output).toContain(
      [
        "  '--spacing-1': {",
        "    components: ['Badge'],",
        '    viaProps: [],',
        '  },',
      ].join('\n'),
    );
    expect(output).toContain(
      [
        "  '--spacing-2': {",
        "    components: ['Button', 'Card'],",
        "    viaProps: ['Stack'],",
        '  },',
      ].join('\n'),
    );
    expect(output.endsWith('};\n')).toBe(true);
  });

  it('refuses to render an empty map', () => {
    // The generator must fail the build loudly rather than ship a valid but
    // blank module — the silent-under-report failure mode this feature has
    // already had once.
    expect(() => spacingUsageLib.renderSpacingUsageModule({})).toThrow(
      /no spacing usage/,
    );
  });
});
