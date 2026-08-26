// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createRequire} from 'node:module';

const {buildVisualSection} = createRequire(import.meta.url)('./visual-format.js');

const verdict = (overrides = {}) => ({
  status: 'pass',
  counts: {total: 16, unchanged: 16, changed: 0, added: 0, removed: 0, failed: 0},
  changes: [],
  ...overrides,
});

describe('buildVisualSection', () => {
  it('renders nothing when the job did not run', () => {
    expect(buildVisualSection(null)).toBe('');
  });

  it('says so plainly when nothing moved', () => {
    expect(buildVisualSection(verdict())).toContain('No visual change across 16 compared shot(s)');
  });

  it('calls an unbaselined shot exactly that, not an addition', () => {
    const section = buildVisualSection(
      verdict({counts: {total: 20, unchanged: 14, changed: 0, added: 6, removed: 0, failed: 0}}),
    );
    expect(section).toContain('No visual change across 14 compared shot(s)');
    expect(section).toContain('6 shot(s) have no baseline yet');
  });

  it('states the reason for a skip, so a broad PR does not look like a pass', () => {
    const section = buildVisualSection(
      verdict({status: 'skipped', reason: '900 shots exceeds the 240-shot budget'}),
    );
    expect(section).toContain('Skipped');
    expect(section).toContain('900 shots exceeds the 240-shot budget');
  });

  it('renders verdict strings as one-line literal text', () => {
    const section = buildVisualSection(
      verdict({status: 'skipped', reason: 'first line\n## not a heading, just <em>text</em>'}),
    );
    expect(section).toContain('first line ## not a heading, just &lt;em&gt;text&lt;/em&gt;');
    expect(section).not.toContain('\n## not a heading');
  });

  it('keeps a change row a single table row whatever the field contents', () => {
    const section = buildVisualSection(
      verdict({
        counts: {total: 2, unchanged: 1, changed: 1, added: 0, removed: 0, failed: 0},
        changes: [
          {component: 'Cell | with pipes', name: 'story\nnewline', theme: 'y2k', mode: 'light', diffPixels: '1234'},
        ],
      }),
    );
    expect(section).toContain('| Cell \\| with pipes | story newline | y2k | light | 1,234 |');
  });

  it('drops a report link that is not a plain https URL', () => {
    const good = buildVisualSection(verdict({status: 'failed', counts: {total: 1, failed: 1}}), 'https://example.com/report');
    expect(good).toContain('href="https://example.com/report"');
    const bad = buildVisualSection(verdict({status: 'failed', counts: {total: 1, failed: 1}}), 'report.html" onmouseover="x');
    expect(bad).not.toContain('View the report');
  });

  it('lists each changed shot with the theme and mode it changed in', () => {
    const section = buildVisualSection(
      verdict({
        status: 'changed',
        counts: {total: 16, unchanged: 14, changed: 2, added: 0, removed: 0, failed: 0},
        changes: [
          {key: 'a', component: 'Button', name: 'Primary', theme: 'y2k', mode: 'light', diffPixels: 1126},
          {key: 'b', component: 'Button', name: 'Primary', theme: 'y2k', mode: 'dark', diffPixels: 1401},
        ],
      }),
    );
    expect(section).toContain('2 of 16 shot(s) changed');
    expect(section).toContain('| Button | Primary | y2k | light | 1,126 |');
  });

  it('frames a change as a question rather than a failure', () => {
    const section = buildVisualSection(
      verdict({
        status: 'changed',
        counts: {total: 2, unchanged: 1, changed: 1, added: 0, removed: 0, failed: 0},
        changes: [{key: 'a', component: 'B', name: 'S', theme: 't', mode: 'light', diffPixels: 5}],
      }),
    );
    expect(section).toMatch(/question, not a failure/);
  });

  it('caps the table and says how many were left out', () => {
    const changes = Array.from({length: 25}, (_, index) => ({
      key: `k${index}`,
      component: 'C',
      name: 'S',
      theme: 't',
      mode: 'light',
      diffPixels: index,
    }));
    const section = buildVisualSection(
      verdict({status: 'changed', counts: {total: 25, changed: 25}, changes}),
    );
    expect(section).toContain('and 5 more');
  });

  it('embeds before, after, and diff images for changed shots', () => {
    const section = buildVisualSection(
      verdict({
        status: 'changed',
        counts: {total: 2, unchanged: 1, changed: 1, added: 0, removed: 0, failed: 0},
        changes: [
          {
            key: 'core-button--primary__y2k-light',
            component: 'Button',
            name: 'Primary',
            theme: 'y2k',
            mode: 'light',
            diffPixels: 12,
          },
        ],
      }),
      'https://facebook.github.io/astryx/pr/123/visual/',
    );
    expect(section).toContain(
      'https://raw.githubusercontent.com/facebook/astryx/gh-pages/pr/123/visual/before/core-button--primary__y2k-light.png',
    );
    expect(section).toContain('raw.githubusercontent.com/facebook/astryx/gh-pages/pr/123/visual/after/core-button--primary__y2k-light.png');
    expect(section).toContain('raw.githubusercontent.com/facebook/astryx/gh-pages/pr/123/visual/diff/core-button--primary__y2k-light.png');
    expect(section).toContain('<th>Before</th><th>After</th><th>Diff</th>');
  });

  it('embeds at most three deltas so the PR comment stays readable', () => {
    const changes = Array.from({length: 5}, (_, index) => ({
      key: `shot-${index}`,
      component: 'C',
      name: 'S',
      theme: 't',
      mode: 'light',
      diffPixels: 1,
    }));
    const section = buildVisualSection(
      verdict({status: 'changed', counts: {total: 5, changed: 5}, changes}),
      'https://example.com/visual/',
    );
    expect((section.match(/<details open>/g) ?? []).length).toBe(3);
    expect(section).not.toContain('/before/shot-3.png');
  });

  it('reports a capture failure distinctly from a change', () => {
    const section = buildVisualSection(
      verdict({status: 'failed', counts: {total: 4, failed: 2, changed: 0}}),
    );
    expect(section).toContain('2 shot(s) could not be captured');
  });

  it('links the report when one was published', () => {
    const section = buildVisualSection(
      verdict({
        status: 'changed',
        counts: {total: 1, changed: 1},
        changes: [{key: 'a', component: 'B', name: 'S', theme: 't', mode: 'light', diffPixels: 1}],
      }),
      'https://example.com/report/',
    );
    expect(section).toContain('https://example.com/report/');
  });
});
