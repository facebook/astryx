// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateMarkdownFixture} from './benchmark';
import {
  getMarkdownBenchmarkPlugins,
  getMarkdownBenchmarkProfile,
  MARKDOWN_BENCHMARK_PROFILES,
} from './benchmarkProfiles';

describe('Markdown performance profiles', () => {
  const source = generateMarkdownFixture(20);
  const softBreaks = getMarkdownBenchmarkProfile('soft-breaks');
  const callouts = getMarkdownBenchmarkProfile('callouts');
  const entityReferences = getMarkdownBenchmarkProfile('entity-references');

  it('uses the same prepared fixture for paired empty and plugin runs', () => {
    expect(softBreaks.plugins).toHaveLength(1);
    expect(softBreaks.prepareSource(source, 'none')).toBe(source);
    expect(getMarkdownBenchmarkPlugins(softBreaks, 'baseline')).toHaveLength(0);
    expect(getMarkdownBenchmarkPlugins(softBreaks, 'plugin')).toBe(
      softBreaks.plugins,
    );
  });

  it('provides deterministic sparse and dense soft-break fixtures', () => {
    expect(
      softBreaks.prepareSource(source, 'sparse').match(/\nand inline /g),
    ).toHaveLength(2);
    expect(
      softBreaks.prepareSource(source, 'dense').match(/\nand inline /g),
    ).toHaveLength(20);
  });

  it('provides deterministic sparse and dense callout fixtures', () => {
    expect(callouts.prepareSource(source, 'none')).toBe(source);
    expect(
      callouts.prepareSource(source, 'sparse').match(/:::info Performance/g),
    ).toHaveLength(2);
    expect(
      callouts.prepareSource(source, 'dense').match(/:::info Performance/g),
    ).toHaveLength(20);
    expect(getMarkdownBenchmarkPlugins(callouts, 'baseline')).toHaveLength(0);
    expect(getMarkdownBenchmarkPlugins(callouts, 'plugin')).toBe(
      callouts.plugins,
    );
  });

  it('provides deterministic sparse and dense entity-reference fixtures', () => {
    expect(entityReferences.prepareSource(source, 'none')).toBe(source);
    expect(
      entityReferences.prepareSource(source, 'sparse').match(/@\{section-/g),
    ).toHaveLength(2);
    expect(
      entityReferences.prepareSource(source, 'dense').match(/@\{section-/g),
    ).toHaveLength(20);
  });

  it('keeps profile ids unique', () => {
    expect(
      new Set(MARKDOWN_BENCHMARK_PROFILES.map(profile => profile.id)).size,
    ).toBe(MARKDOWN_BENCHMARK_PROFILES.length);
  });
});
