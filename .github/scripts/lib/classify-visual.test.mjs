// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file classify-visual.test.mjs
 * Tests for the static visual-diff classifier (#3667): signal detection,
 * file filtering, scoring buckets, and the review-signal loading contract.
 */

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import {classifyVisualDiff, JSX_CAP} from './classify-visual.js';

// Build a minimal unified diff for a single file. Lines are raw content;
// they get prefixed with +/- here.
function makeDiff(file, added = [], removed = []) {
  return [
    `diff --git a/${file} b/${file}`,
    'index 1111111..2222222 100644',
    `--- a/${file}`,
    `+++ b/${file}`,
    '@@ -1,9 +1,9 @@',
    ...removed.map(l => `-${l}`),
    ...added.map(l => `+${l}`),
  ].join('\n');
}

describe('classifyVisualDiff', () => {
  it('returns non-visual for an empty diff', () => {
    const result = classifyVisualDiff('');
    expect(result.score).toBe(0);
    expect(result.bucket).toBe('non-visual');
  });

  it('counts CSS property edits inside a component file', () => {
    const diff = makeDiff('packages/core/src/Button/Button.tsx', [
      'paddingBlock: spacingVars.sm,',
      "minHeight: '2.5rem',",
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(2);
    // 2×3 (props) + 1×2 (spacingVars token) = 8
    expect(result.score).toBe(8);
    expect(result.bucket).toBe('likely-visual');
  });

  it('counts removed lines as well as added lines', () => {
    const diff = makeDiff('packages/core/src/Card/Card.tsx', [], [
      'boxShadow: shadowVars.raised,',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(1);
    expect(result.signals.tokenReferences).toBe(1);
  });

  it('does not count TypeScript type members as CSS properties', () => {
    const diff = makeDiff('packages/core/src/Button/Button.tsx', [
      'width: number;',
      'height: string;',
      'color: string,',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(0);
  });

  it('matches every token group via the generic *Vars. pattern', () => {
    const diff = makeDiff('packages/core/src/Card/Card.tsx', [
      'boxShadow: shadowVars.overlay,',
      'borderColor: borderVars.subtle,',
      'transitionDuration: durationVars.fast,',
      "fontSize: textSizeVars['--font-size-sm'],",
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.tokenReferences).toBe(4);
  });

  it('flags style-surface files by path', () => {
    const diff = [
      makeDiff('packages/core/src/Field/inputStyles.stylex.ts', ['const x = 1;']),
      makeDiff('apps/docsite/src/app/globals.css', ['--brand-accent: #f00;']),
      makeDiff('packages/themes/matcha/src/theme.ts', ['const y = 2;']),
    ].join('\n');
    const result = classifyVisualDiff(diff);
    expect(result.signals.styleSurfaceFiles).toBe(3);
    expect(result.styleSurfacePaths).toContain('packages/core/src/Field/inputStyles.stylex.ts');
  });

  it('does not flag marker stylex files as style surfaces', () => {
    const diff = makeDiff('packages/core/src/CheckboxInput/checkbox.markers.stylex.ts', [
      'export const hoverMarker = stylex.defineMarker();',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.styleSurfaceFiles).toBe(0);
  });

  it('counts kebab-case properties and custom properties in .css files', () => {
    const diff = makeDiff('apps/docsite/src/app/globals.css', [
      'background-color: #fff;',
      '--sidebar-width: 240px;',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(2);
    expect(result.signals.styleSurfaceFiles).toBe(1);
  });

  it('still flags deleted style-surface files', () => {
    const diff = [
      'diff --git a/packages/core/src/Layout/padding.stylex.ts b/packages/core/src/Layout/padding.stylex.ts',
      'deleted file mode 100644',
      '--- a/packages/core/src/Layout/padding.stylex.ts',
      '+++ /dev/null',
      '@@ -1,2 +0,0 @@',
      '-export const padding = stylex.create({',
      '-  root: {padding: spacingVars.md},',
    ].join('\n');
    const result = classifyVisualDiff(diff);
    expect(result.signals.styleSurfaceFiles).toBe(1);
    expect(result.signals.tokenReferences).toBe(1);
  });

  it('ignores test, story, doc, and markdown files entirely', () => {
    const styleLine = 'padding: spacingVars.md,';
    const diff = [
      makeDiff('packages/core/src/Button/Button.test.tsx', [styleLine]),
      makeDiff('apps/storybook/stories/Button.stories.tsx', [styleLine]),
      makeDiff('packages/core/src/Button/Button.doc.mjs', [styleLine]),
      makeDiff('packages/core/src/__tests__/TestIcon.tsx', ['<svg viewBox="0 0 24 24">']),
      // ESLint-plugin fixture of intentional style violations
      makeDiff('packages/core/src/Badge/Badge.test-violations.tsx', [
        "fontSize: '14px',",
        "color: '#ff0000',",
      ]),
      makeDiff('CONTRIBUTING.md', [styleLine]),
    ].join('\n');
    const result = classifyVisualDiff(diff);
    expect(result.score).toBe(0);
    expect(result.bucket).toBe('non-visual');
  });

  it('does not scan YAML/JSON files for property-like keys', () => {
    const diff = makeDiff('apps/docsite/config.yml', ['width: 100']);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(0);
  });

  it('scans only product surfaces — tooling files never count', () => {
    const diff = [
      makeDiff('.github/scripts/test-pr-enrichment.js', [
        "{ file: 'packages/core/src/Button/Button.tsx', line: 'paddingBlock: spacingVars.sm,' },",
      ]),
      makeDiff('vitest.config.ts', ["fontSize: '14px',"]),
      makeDiff('scripts/build-css.mjs', ['padding: spacingVars.md,']),
    ].join('\n');
    const result = classifyVisualDiff(diff);
    expect(result.score).toBe(0);
    expect(result.bucket).toBe('non-visual');
  });

  it('skips comment lines', () => {
    const diff = makeDiff('packages/core/src/Button/Button.tsx', [
      '// padding: spacingVars.md,',
      '* color: colorVars.accent',
      '/* opacity: 0.5 */',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.score).toBe(0);
  });

  it('skips lines inside multi-line block comments', () => {
    const diff = makeDiff('packages/core/src/Button/Button.tsx', [
      '/*',
      'padding: spacingVars.md,',
      'opacity: 0.5,',
      '*/',
      'gap: spacingVars.sm,',
    ]);
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(1);
    expect(result.signals.tokenReferences).toBe(1);
    expect(result.evidence.cssProperties[0].line).toBe('gap: spacingVars.sm,');
  });

  it('tracks block-comment state per diff side', () => {
    // A removed `/*` must not silence added lines.
    const diff = [
      'diff --git a/packages/core/src/Button/Button.tsx b/packages/core/src/Button/Button.tsx',
      'index 1111111..2222222 100644',
      '--- a/packages/core/src/Button/Button.tsx',
      '+++ b/packages/core/src/Button/Button.tsx',
      '@@ -1,3 +1,3 @@',
      '-/*',
      '+opacity: 0.5,',
      '-*/',
    ].join('\n');
    const result = classifyVisualDiff(diff);
    expect(result.signals.cssProperties).toBe(1);
  });

  it('counts JSX structural changes only in packages/**/*.tsx', () => {
    const jsxLines = ['<VisuallyHidden>', '</VisuallyHidden>'];
    const inPackages = classifyVisualDiff(
      makeDiff('packages/core/src/Banner/Banner.tsx', jsxLines)
    );
    expect(inPackages.signals.jsxStructuralChanges).toBe(2);

    const inApps = classifyVisualDiff(
      makeDiff('apps/docsite/src/app/page.tsx', jsxLines)
    );
    expect(inApps.signals.jsxStructuralChanges).toBe(0);
  });

  it('excludes JSX fragments from the structural signal', () => {
    const diff = makeDiff('packages/core/src/Banner/Banner.tsx', ['<>', '</>']);
    const result = classifyVisualDiff(diff);
    expect(result.signals.jsxStructuralChanges).toBe(0);
  });

  it('caps the JSX contribution to the score', () => {
    const lines = Array.from({length: JSX_CAP + 5}, (_, i) => `<div data-i={${i}}>`);
    const result = classifyVisualDiff(makeDiff('packages/core/src/Table/Table.tsx', lines));
    expect(result.signals.jsxStructuralChanges).toBe(JSX_CAP + 5);
    expect(result.score).toBe(JSX_CAP);
  });

  it('buckets scores per the #3667 thresholds', () => {
    // 4 props + 4 token refs + 1 style file in a stylex file: 12+8+3 → visual
    const visual = classifyVisualDiff(
      makeDiff('packages/core/src/Field/inputStyles.stylex.ts', [
        'padding: spacingVars.md,',
        'color: colorVars.accent,',
        'borderRadius: radiusVars.lg,',
        'gap: spacingVars.xs,',
      ])
    );
    expect(visual.bucket).toBe('visual');

    // A lone token-reference swap: 2 → maybe
    const maybe = classifyVisualDiff(
      makeDiff('packages/core/src/Button/Button.tsx', ['const tone = colorVars.accent;'])
    );
    expect(maybe.score).toBe(2);
    expect(maybe.bucket).toBe('maybe-visual');

    // Pure logic change → non-visual
    const logic = classifyVisualDiff(
      makeDiff('packages/core/src/Table/useSort.ts', [
        'const sorted = useMemo(() => rows.sort(compare), [rows, compare]);',
      ])
    );
    expect(logic.bucket).toBe('non-visual');
  });

  it('collects capped evidence samples with file attribution', () => {
    const result = classifyVisualDiff(
      makeDiff('packages/core/src/Button/Button.tsx', ['opacity: 0.5,'])
    );
    expect(result.evidence.cssProperties).toEqual([
      {file: 'packages/core/src/Button/Button.tsx', line: 'opacity: 0.5,'},
    ]);
  });

  it('honors opts.ignorePath for caller-defined exclusions (review-signal safe spaces)', () => {
    const isSafeSpace = (p) =>
      /^packages\/lab\//.test(p) || /^apps\/(sandbox|storybook)\//.test(p);
    const diff = [
      makeDiff('packages/lab/src/Rating/Rating.tsx', ['padding: spacingVars.md,']),
      makeDiff('apps/sandbox/src/page.tsx', ['opacity: 0.5,']),
      makeDiff('packages/core/src/Button/Button.tsx', ['gap: spacingVars.sm,']),
    ].join('\n');
    const result = classifyVisualDiff(diff, {ignorePath: isSafeSpace});
    // Only the core Button line counts: 1 prop + 1 token ref
    expect(result.signals.cssProperties).toBe(1);
    expect(result.signals.tokenReferences).toBe(1);
  });
});

describe('review-signal loading contract', () => {
  // review-signal.yml has no checkout: it fetches this file from the base ref
  // via the API and instantiates it with new Function(module, exports, require).
  // Pin that contract so a refactor (ESM syntax, a require of another module)
  // fails here instead of silently breaking the workflow's content signal.
  it('instantiates via new Function without a real require', () => {
    const src = readFileSync(
      fileURLToPath(new URL('./classify-visual.js', import.meta.url)),
      'utf8'
    );
    const mod = {exports: {}};
    new Function('module', 'exports', 'require', src)(mod, mod.exports, () => {
      throw new Error('classify-visual.js must stay dependency-free');
    });
    const result = mod.exports.classifyVisualDiff(
      makeDiff('packages/core/src/Button/Button.tsx', ['opacity: 0.5,'])
    );
    expect(result.signals.cssProperties).toBe(1);
  });
});
