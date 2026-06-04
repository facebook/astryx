// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the AST-based layout skeleton extractor.
 *
 * The previous regex extractor shipped with ZERO tests — every one of the 37
 * page templates rendered incorrectly (malformed object-literal props,
 * orphaned trees from slot-prop `/>`, unbalanced tags, mid-tree truncation).
 *
 * These tests need NO stored fixtures: every real template is discovered live
 * and checked against structural invariants that must hold for any valid
 * skeleton, plus focused regressions for each historical bug class.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from '@babel/parser';
import {extractSkeleton} from '../skeleton.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.resolve(__dirname, '../../../templates');
const PAGES_DIR = path.join(TEMPLATES, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES, 'blocks');

/** The JSX body must parse as real JSX (wrapped in a fragment for multi-root). */
function assertParseable(skeleton, label) {
  const code = 'const __x = (<>\n' + skeleton + '\n</>);';
  expect(
    () => parse(code, {sourceType: 'module', plugins: ['jsx', 'typescript']}),
    `${label} should produce parseable JSX`,
  ).not.toThrow();
}

/** Every open tag has a matching close, in order. */
function assertBalanced(skeleton, label) {
  const stack = [];
  for (const rawLine of skeleton.split('\n')) {
    const t = rawLine.trim();
    if (!t || t.startsWith('/*') || t === '...') continue;
    if (/^<[A-Za-z]\w*(?:\s[^>]*)?\/>$/.test(t)) continue; // self-closing
    const open = t.match(/^<([A-Za-z]\w*)(?:\s[^>]*)?>$/);
    const close = t.match(/^<\/([A-Za-z]\w*)>$/);
    if (open) stack.push(open[1]);
    else if (close) {
      expect(stack.length, `${label}: stray close </${close[1]}>`).toBeGreaterThan(0);
      expect(stack.pop(), `${label}: mismatched close </${close[1]}>`).toBe(close[1]);
    }
  }
  expect(stack, `${label}: unclosed tags ${stack.join(', ')}`).toEqual([]);
}

/** Component names in the header must be exactly those emitted in the body. */
function assertHeaderMatchesBody(result, label) {
  const inBody = new Set();
  for (const rawLine of result.skeleton.split('\n')) {
    const m = rawLine.trim().match(/^<\/?([A-Z]\w*)/);
    if (m) inBody.add(m[1]);
  }
  expect([...result.components].sort(), `${label}: header must equal body`)
    .toEqual([...inBody].sort());
}

function checkInvariants(name, file) {
  const result = extractSkeleton(fs.readFileSync(file, 'utf-8'));
  expect(result.skeleton.trim(), `${name}: non-empty skeleton`).not.toBe('');
  // Bug 1 regression: object-literal props must never produce `="{`.
  expect(result.skeleton, `${name}: no malformed object-literal prop`).not.toMatch(/="\{/);
  assertParseable(result.skeleton, name);
  assertBalanced(result.skeleton, name);
  assertHeaderMatchesBody(result, name);
}

// ── Discover real templates ────────────────────────────────────────────
const pageEntries = fs.readdirSync(PAGES_DIR, {withFileTypes: true})
  .filter(e => e.isDirectory())
  .map(e => [e.name, path.join(PAGES_DIR, e.name, 'page.tsx')])
  .filter(([, f]) => fs.existsSync(f))
  .sort((a, b) => a[0].localeCompare(b[0]));

function findBlockTsx(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findBlockTsx(f));
    else if (/\.tsx$/.test(e.name) && !/\.doc\./.test(e.name)) out.push(f);
  }
  return out;
}
const blockEntries = findBlockTsx(BLOCKS_DIR)
  .map(f => [path.basename(f, '.tsx'), f])
  .sort((a, b) => a[0].localeCompare(b[0]));

describe('extractSkeleton — invariants for every page template', () => {
  it('discovers all page templates', () => {
    expect(pageEntries.length).toBeGreaterThanOrEqual(37);
  });
  it.each(pageEntries)('page %s: parses, balanced, header==body, no malformed props', checkInvariants);
});

describe('extractSkeleton — invariants for every block template', () => {
  it.each(blockEntries)('block %s', (name, file) => {
    const result = extractSkeleton(fs.readFileSync(file, 'utf-8'));
    // Blocks may legitimately be tiny; only require well-formedness when non-empty.
    if (result.skeleton.trim() === '') return;
    expect(result.skeleton, `${name}: no malformed prop`).not.toMatch(/="\{/);
    assertParseable(result.skeleton, name);
    assertBalanced(result.skeleton, name);
    assertHeaderMatchesBody(result, name);
  });
});

describe('extractSkeleton — bug-class regressions', () => {
  it('Bug 1: object-literal props render intact, not as broken strings', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return <XDSGrid columns={{minWidth: 240, repeat: 'fit'}} gap={4}><XDSCard /></XDSGrid>;
      }`);
    expect(skeleton).toContain('columns={{minWidth: 240, repeat: "fit"}}');
    expect(skeleton).not.toContain('columns="{minWidth:');
  });

  it('Bug 2: a self-closing child in a slot prop does NOT self-close the parent', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return (
          <XDSAppShell sideNav={<XDSSideNav />} variant="elevated">
            <XDSVStack gap={4}><XDSCard /></XDSVStack>
          </XDSAppShell>
        );
      }`);
    expect(skeleton).toMatch(/<AppShell[^>]*>/);     // opens
    expect(skeleton).not.toMatch(/<AppShell[^>]*\/>/); // not self-closed
    expect(skeleton).toContain('/* sideNav: */');
    expect(skeleton).toContain('<SideNav />');
    assertBalanced(skeleton, 'bug2');
  });

  it('Bug 3: output is always tag-balanced even with skipped wrappers', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return (
          <div style={{padding: 16}}>
            <XDSLayout><XDSLayoutContent><XDSText /></XDSLayoutContent></XDSLayout>
          </div>
        );
      }`);
    assertBalanced(skeleton, 'bug3');
    assertParseable(skeleton, 'bug3');
  });

  it('Bug 4: truncation never leaves an unclosed tag', () => {
    const rows = Array.from({length: 200}, () => '<XDSCard />').join('\n');
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return <XDSAppShell><XDSVStack gap={2}>${rows}</XDSVStack></XDSAppShell>;
      }`);
    expect(skeleton).toContain('...');
    assertBalanced(skeleton, 'bug4');
    expect(skeleton.trimEnd().endsWith('</AppShell>')).toBe(true);
  });

  it('Bug 5: header components equal body components', () => {
    const result = extractSkeleton(`
      export default function T() {
        return <XDSAppShell sideNav={<XDSSideNav />}><XDSCard><XDSText /></XDSCard></XDSAppShell>;
      }`);
    assertHeaderMatchesBody(result, 'bug5');
    expect(result.components).toEqual(['AppShell', 'Card', 'SideNav', 'Text']);
  });

  it('Bug 6: nesting depth reflects real structure (indentation increases)', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return (
          <XDSAppShell><XDSCard><XDSVStack gap={2}><XDSText /></XDSVStack></XDSCard></XDSAppShell>
        );
      }`);
    const lines = skeleton.split('\n');
    const indent = tag => {
      const l = lines.find(x => x.includes(tag));
      return l.length - l.trimStart().length;
    };
    expect(indent('<AppShell')).toBe(0);
    expect(indent('<Card')).toBe(2);
    expect(indent('<VStack')).toBe(4);
    expect(indent('<Text')).toBe(6);
  });

  it('inlines local helper components so structure is complete', () => {
    const {skeleton, components} = extractSkeleton(`
      function Sidebar() { return <XDSSideNav><XDSSideNavItem /></XDSSideNav>; }
      export default function T() {
        return <XDSAppShell sideNav={<Sidebar />}><XDSCard /></XDSAppShell>;
      }`);
    expect(skeleton).toContain('<SideNav>');
    expect(skeleton).toContain('<SideNavItem />');
    expect(components).toContain('SideNavItem');
  });

  it('descends into array .map() render callbacks', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return <XDSVStack gap={2}>{items.map(i => <XDSCard key={i} />)}</XDSVStack>;
      }`);
    expect(skeleton).toContain('<VStack gap={2}>');
    expect(skeleton).toContain('<Card />');
  });

  it('derives slot markers structurally — any JSX-valued prop, no hardcoded list', () => {
    // `drawer` is NOT a name the extractor knows ahead of time; it should still
    // be treated as a slot purely because its value is JSX.
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return (
          <XDSAppShell drawer={<XDSCard />} sideNav={<XDSSideNav />}>
            <XDSText />
          </XDSAppShell>
        );
      }`);
    expect(skeleton).toContain('/* drawer: */');
    expect(skeleton).toContain('/* sideNav: */');
    expect(skeleton).toContain('<Card />');
    assertBalanced(skeleton, 'derived-slots');
  });

  it('handles slot props whose value is a ternary or .map()', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return (
          <XDSLayout
            header={cond ? <XDSTopNav /> : <XDSToolbar />}
            content={items.map(i => <XDSTab key={i} />)}>
            <XDSText />
          </XDSLayout>
        );
      }`);
    expect(skeleton).toContain('/* header: */');
    expect(skeleton).toContain('/* content: */');
    expect(skeleton).toMatch(/<TopNav \/>|<Toolbar \/>/);
    expect(skeleton).toContain('<Tab />');
    assertBalanced(skeleton, 'slot-expr');
  });

  it('shows layout props via a noise blocklist (new XDS props appear automatically)', () => {
    // `inset` is invented here — not in any allowlist — and must still render.
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return <XDSCard inset="lg" gap={4} onClick={handle} aria-label="x" className="y" />;
      }`);
    expect(skeleton).toContain('inset="lg"');
    expect(skeleton).toContain('gap={4}');
    // Noise (handlers, aria-, className) is suppressed.
    expect(skeleton).not.toContain('onClick');
    expect(skeleton).not.toContain('aria-label');
    expect(skeleton).not.toContain('className');
  });

  it('omits complex/computed prop values rather than rendering garbage', () => {
    const {skeleton} = extractSkeleton(`
      export default function T() {
        return <XDSGrid columns={getColumns()} gap={someVar} padding={4} />;
      }`);
    // Computed values are dropped; clean literals stay.
    expect(skeleton).toContain('padding={4}');
    expect(skeleton).not.toContain('getColumns');
    expect(skeleton).not.toContain('someVar');
    expect(skeleton).not.toMatch(/="\{/);
  });

  it('returns empty result for source with no default-export JSX', () => {
    const result = extractSkeleton('export const x = 1;');
    expect(result).toEqual({skeleton: '', components: []});
  });

  it('returns empty result for unparseable source rather than throwing', () => {
    const result = extractSkeleton('export default function ( { <<< broken');
    expect(result).toEqual({skeleton: '', components: []});
  });
});
