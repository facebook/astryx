// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for RTL contextual decorations and applicability coverage.
 */

import {JSDOM} from 'jsdom';
import {describe, expect, it} from 'vitest';
import {
  buildAuditedComponentRoster,
  buildComponentCoverage,
  classifyDirectionalDecorationPair,
  collectDirectionalDecorations,
} from '../../apps/storybook/rtl-audit/rtl-audit-coverage.mjs';

const IDENTITY = [1, 0, 0, 1];
const MIRROR = [-1, 0, 0, 1];

function decoration(glyph, policy, matrix = IDENTITY) {
  return {glyph, policy, matrix};
}

describe('collectDirectionalDecorations', () => {
  it('detects a slash used between repeated list items', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true">/</span><a>Home</a></li>
        <li><span aria-hidden="true">/</span><a>Docs</a></li>
      </ol>
      <p>Control: and/or · 08/24 · /settings</p>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found).toHaveLength(2);
    expect(found[0]).toMatchObject({glyph: '/', policy: 'explicit'});
  });

  it('follows a nested glyph element that carries the mirror transform', () => {
    const dom = new JSDOM(`
      <ol>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Home</a></li>
        <li><span aria-hidden="true"><span style="transform: matrix(-1, 0, 0, 1, 0, 0)">→</span></span><a>Docs</a></li>
      </ol>
    `);
    const found = collectDirectionalDecorations({
      root: dom.window.document,
      requireVisible: false,
    });
    expect(found[0].matrix).toEqual(MIRROR);
  });

  it('ignores the same slash without a directional decoration context', () => {
    const dom = new JSDOM('<p aria-hidden="true">/</p><p>and/or</p>');
    expect(
      collectDirectionalDecorations({
        root: dom.window.document,
        requireVisible: false,
      }),
    ).toEqual([]);
  });
});

describe('classifyDirectionalDecorationPair', () => {
  it('fails a bare contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit'),
      ),
    ).toMatchObject({verdict: 'fail'});
  });

  it('passes a mirrored contextual arrow', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('→', 'explicit'),
        decoration('→', 'explicit', MIRROR),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('passes an unchanged Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi'),
      ),
    ).toMatchObject({verdict: 'pass'});
  });

  it('fails an explicitly mirrored Unicode-mirrored angle quote', () => {
    expect(
      classifyDirectionalDecorationPair(
        decoration('›', 'auto-bidi'),
        decoration('›', 'auto-bidi', MIRROR),
      ),
    ).toMatchObject({verdict: 'fail'});
  });
});

describe('buildComponentCoverage', () => {
  it('classifies measured, verified N/A, unexplained gaps, and stale declarations', () => {
    const coverage = buildComponentCoverage({
      components: [
        'core/Breadcrumbs',
        'core/Button',
        'core/Text',
        'core/Pagination',
      ],
      decorationResults: [
        {
          component: 'core/Breadcrumbs',
          storyId: 'core-breadcrumbs--default',
          verdict: 'pass',
        },
      ],
      autoResults: [
        {
          component: 'core/Pagination',
          storyId: 'core-pagination--default',
          verdict: 'pass',
        },
      ],
      verifiedNa: [
        {
          component: 'core/Text',
          reason: 'Text has no direction-sensitive visual or behavior.',
        },
        {component: 'core/Pagination', reason: 'stale reason'},
      ],
    });

    expect(coverage).toMatchObject({
      total: 4,
      measured: 1,
      verifiedNa: 1,
      gaps: 1,
      staleVerifiedNa: 1,
    });
    expect(
      Object.fromEntries(
        coverage.results.map(result => [result.component, result.status]),
      ),
    ).toEqual({
      'core/Breadcrumbs': 'measured',
      'core/Button': 'coverage-gap',
      'core/Pagination': 'stale-verified-na',
      'core/Text': 'verified-na',
    });
  });

  it('keeps missing stories and audit errors as coverage gaps', () => {
    const coverage = buildComponentCoverage({
      components: ['core/MissingStory', 'core/BrokenAudit'],
      autoResults: [
        {
          component: 'core/BrokenAudit',
          storyId: 'core-broken--default',
          verdict: 'ERROR',
        },
      ],
      curatedResults: [
        {
          component: 'core/MissingStory',
          storyId: 'core-missing--default',
          rollup: 'MISSING-STORY',
        },
      ],
    });
    expect(coverage.measured).toBe(0);
    expect(coverage.gaps).toBe(2);
  });

  it('keeps same-named Core and Lab components distinct', () => {
    const coverage = buildComponentCoverage({
      components: ['core/Chat', 'lab/Chat'],
    });
    expect(coverage.results.map(result => result.component)).toEqual([
      'core/Chat',
      'lab/Chat',
    ]);
    expect(coverage.gaps).toBe(2);
  });
});

describe('buildAuditedComponentRoster', () => {
  it('uses an umbrella Storybook surface without adding an unknown duplicate', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/ChatComposer', 'core/ChatMessage'],
        storyComponents: ['core/chat', 'core/chatcomposer'],
        filters: ['chat'],
      }),
    ).toEqual(['core/chat']);
  });

  it('retains an unknown entry when neither source nor stories match', () => {
    expect(
      buildAuditedComponentRoster({
        sourceComponents: ['core/Button'],
        storyComponents: ['core/button'],
        filters: ['missing'],
      }),
    ).toEqual(['unknown/missing']);
  });
});
