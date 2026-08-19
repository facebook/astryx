// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adoption-eval.test.ts
 * @position internal/vibe-tests/adoption-test — tests for the deterministic scorer
 *
 * The scorer is the whole experiment: if it can't tell an adoption from a
 * hand-roll, or misses the frictions it claims to measure, every number this
 * test produces is decoration. So each check is asserted on a sample that
 * should trip it AND on one that shouldn't.
 */

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  a11yFacts,
  analyze,
  analyzeAdoption,
  analyzeBlastRadius,
  analyzeEscapeHatches,
  analyzeSemanticFidelity,
  analyzeVerification,
  type ChangedFile,
} from './adoption-eval';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const sample = (kind: 'adopted' | 'hand-rolled') =>
  fs.readFileSync(path.join(FIXTURES, kind, 'ticket-hovercard.tsx'), 'utf8');

const asAdded = (p: string, content: string): ChangedFile => ({
  path: p,
  status: 'added',
  content,
});

const NEW_FILE = 'components/entity/ticket-hovercard.tsx';
const adopted = () => [asAdded(NEW_FILE, sample('adopted'))];
const handRolled = () => [asAdded(NEW_FILE, sample('hand-rolled'))];

describe('adoption decision', () => {
  it('reads the design system out of the import graph', () => {
    const result = analyzeAdoption(adopted());
    expect(result.decision).toBe('astryx');
    expect(result.astryxComponents).toContain('HoverCard');
    expect(result.astryxComponents).toContain('Badge');
  });

  it('calls a copied-precedent overlay hand-rolled', () => {
    const result = analyzeAdoption(handRolled());
    expect(result.decision).toBe('hand-rolled');
    expect(result.handRolledSurfaces).toEqual([NEW_FILE]);
    expect(result.astryxImports).toHaveLength(0);
  });

  it('separates app components from both', () => {
    const usesAppUi = [
      asAdded(
        NEW_FILE,
        `import {HoverCard} from '@/components/ui/hover-card';\nexport const X = () => <HoverCard />;`,
      ),
    ];
    expect(analyzeAdoption(usesAppUi).decision).toBe('app-component');
  });

  it('flags a diff that uses both as mixed', () => {
    const both = [
      asAdded(
        NEW_FILE,
        `import {Badge} from '@astryxdesign/core/Badge';\nimport {Card} from '@/components/ui/card';`,
      ),
    ];
    expect(analyzeAdoption(both).decision).toBe('mixed');
  });
});

describe('escape hatches', () => {
  it('counts the overrides a non-adopting diff needed', () => {
    const {total, byKind} = analyzeEscapeHatches(handRolled());
    expect(byKind.arbitraryValue?.length).toBeGreaterThan(0);
    expect(byKind.negativeMargin?.length).toBeGreaterThan(0);
    expect(byKind.rawHex?.length).toBeGreaterThan(0);
    expect(byKind.inlineStyle?.length).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(5);
  });

  it('finds none in the adopted sample', () => {
    expect(analyzeEscapeHatches(adopted()).total).toBe(0);
  });

  it('records where each one is, not just how many', () => {
    const [hit] = analyzeEscapeHatches(handRolled()).byKind.rawHex;
    expect(hit.file).toBe(NEW_FILE);
    expect(hit.line).toBeGreaterThan(0);
    expect(hit.snippet).toContain('#');
  });
});

describe('semantic fidelity', () => {
  it('catches a status whose meaning changed in the port', () => {
    const {mismatches, preserved} = analyzeSemanticFidelity(handRolled());
    expect(preserved).toBe(false);
    const needsReview = mismatches.find(m => m.status === 'needs_review');
    expect(needsReview).toMatchObject({expected: 'attention', got: 'info'});
  });

  it('does not report a renamed tone as a lost meaning', () => {
    // `positive`/`success` and `danger`/`error` are the same claim in two
    // vocabularies. Reporting those would bury the one that matters.
    const {mismatches} = analyzeSemanticFidelity(handRolled());
    expect(mismatches.map(m => m.status)).not.toContain('succeeded');
    expect(mismatches.map(m => m.status)).not.toContain('failed');
    expect(mismatches.map(m => m.status)).not.toContain('blocked');
  });

  it('catches the mapping being re-derived away from its source of truth', () => {
    expect(analyzeSemanticFidelity(handRolled()).reDerivedIn).toEqual([
      NEW_FILE,
    ]);
  });

  it('passes a diff that translates through the canonical mapping', () => {
    const result = analyzeSemanticFidelity(adopted());
    expect(result.mismatches).toEqual([]);
    expect(result.reDerivedIn).toEqual([]);
    expect(result.preserved).toBe(true);
  });
});

describe('accessibility statics', () => {
  it('sees hover with no focus path', () => {
    const facts = a11yFacts(sample('hand-rolled'));
    expect(facts.hoverHandlers).toBeGreaterThan(0);
    expect(facts.focusHandlers).toBe(0);
    expect(analyze(handRolled()).a11y.hoverWithoutFocusPath).toEqual([
      NEW_FILE,
    ]);
  });

  it('does not flag the adopted sample, which carries a focus trigger', () => {
    expect(analyze(adopted()).a11y.hoverWithoutFocusPath).toEqual([]);
  });

  it('measures a delta against the code that was replaced', () => {
    const replaced: ChangedFile[] = [
      {
        path: 'components/env-picker.tsx',
        status: 'modified',
        before: `<div onClick={pick} className="hover:bg-accent">{label}</div>`,
        content: `<ListItem onKeyDown={onKey} tabIndex={0} role="option" className="focus-visible:ring-ring" onClick={pick} />`,
      },
    ];
    const {a11y} = analyze(replaced);
    expect(a11y.keyboardPathAdded).toBe(true);
    expect(a11y.focusIndicatorAdded).toBe(true);
    expect(a11y.clickableNonInteractiveDelta).toBeLessThan(0);
  });
});

describe('verification ordering', () => {
  const log = (ts: string, argv: string[], status = 0) => ({ts, argv, status});

  it('knows a lookup happened before the first write', () => {
    const result = analyzeVerification(
      [log('2026-01-01T00:00:00Z', ['search', 'hover preview'])],
      {firstWriteAt: '2026-01-01T00:05:00Z'},
    );
    expect(result.lookedUpBeforeWriting).toBe(true);
    expect(result.lookupsBeforeFirstWrite).toBe(1);
  });

  it('does not count a lookup made after the code was already written', () => {
    const result = analyzeVerification(
      [log('2026-01-01T00:10:00Z', ['component', 'HoverCard'])],
      {firstWriteAt: '2026-01-01T00:05:00Z'},
    );
    expect(result.lookedUpBeforeWriting).toBe(false);
  });

  it('reports unknown rather than guessing when the write time is unknown', () => {
    expect(
      analyzeVerification([log('2026-01-01T00:00:00Z', ['search', 'x'])])
        .lookedUpBeforeWriting,
    ).toBeNull();
  });

  it('counts failed CLI calls as setup friction', () => {
    expect(
      analyzeVerification([log('2026-01-01T00:00:00Z', ['gap-report'], 1)])
        .setupFailures,
    ).toEqual(['gap-report']);
  });
});

describe('blast radius', () => {
  it('separates the feature from shared and global surfaces', () => {
    const files: ChangedFile[] = [
      asAdded(NEW_FILE, 'x'),
      {path: 'components/ui/hover-card.tsx', status: 'modified', content: 'x'},
      {path: 'app/globals.css', status: 'modified', content: 'x'},
      {path: 'package.json', status: 'modified', content: 'x'},
    ];
    const blast = analyzeBlastRadius(files);
    expect(blast.feature).toEqual([NEW_FILE]);
    expect(blast.touchedSharedPrimitives).toEqual([
      'components/ui/hover-card.tsx',
    ]);
    expect(blast.touchedGlobal).toEqual(['app/globals.css']);
    expect(blast.touchedConfig).toEqual(['package.json']);
  });
});

describe('flags', () => {
  it('calls out a hand-roll decided without a single lookup', () => {
    const {flags} = analyze(handRolled(), []);
    expect(flags.join('\n')).toMatch(/decided without looking/);
  });

  it('does not call it that when the agent did look and still hand-rolled', () => {
    const {flags} = analyze(handRolled(), [
      {ts: '2026-01-01T00:00:00Z', argv: ['search', 'hover'], status: 0},
    ]);
    expect(flags.join('\n')).not.toMatch(/decided without looking/);
  });

  it('treats an expensive adoption as a product finding, not a win', () => {
    const expensive = [
      asAdded(
        NEW_FILE,
        `import {HoverCard} from '@astryxdesign/core/HoverCard';
         export const X = () => (
           <HoverCard className="-m-3 w-[280px] z-[9999]" style={{padding: 0}}>
             <span className="text-[11px] bg-[#141417]" />
           </HoverCard>
         );`,
      ),
    ];
    const {adoption, flags} = analyze(expensive);
    expect(adoption.decision).toBe('astryx');
    expect(flags.join('\n')).toMatch(/parity cost/);
  });

  it('stays quiet on a clean adoption', () => {
    expect(
      analyze(adopted(), [
        {ts: '2026-01-01T00:00:00Z', argv: ['search', 'hover'], status: 0},
      ]).flags,
    ).toEqual([]);
  });
});
