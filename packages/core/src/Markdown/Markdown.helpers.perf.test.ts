// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.helpers.perf.test.ts
 * @input Deterministic 200/500-section Markdown and zero-work text helpers
 * @output Paired median fast-path evidence for hinted no-claim helpers
 * @position Helper dispatch regression; full FR23 evidence lands after all helpers
 */

import {describe, expect, it} from 'vitest';
import {parseMarkdown} from './parser';
import {createMarkdownPlugin} from './plugins';
import {createMarkdownTextTransform} from './textTransform';

let benchmarkSink = 0;

function benchmarkDocument(sections: number): string {
  return Array.from({length: sections}, (_, index) =>
    [
      `## Section ${index}`,
      '',
      `AST-${index} belongs to @{owner-${index}} with TODO follow-up.`,
      '',
      `- First item ${index}`,
      '- Second item',
      '',
      `> Quoted detail ${index}`,
      '',
      '| Item | Detail |',
      '| --- | --- |',
      `| ${index} | ordinary prose |`,
      '',
      '```text',
      `opaque ${index}`,
      '```',
    ].join('\n'),
  ).join('\n\n');
}

function median(values: ReadonlyArray<number>): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function measureAverage(callback: () => number): number {
  const start = performance.now();
  for (let iteration = 0; iteration < 20; iteration++) {
    benchmarkSink ^= callback();
  }
  return (performance.now() - start) / 20;
}

function pairedMedianRatio(
  baseline: () => number,
  candidate: () => number,
): number {
  for (let warmup = 0; warmup < 10; warmup++) {
    benchmarkSink ^= baseline();
    benchmarkSink ^= candidate();
  }
  const ratios: number[] = [];
  for (let round = 0; round < 9; round++) {
    const baselineFirst = round % 2 === 0;
    const first = measureAverage(baselineFirst ? baseline : candidate);
    const second = measureAverage(baselineFirst ? candidate : baseline);
    const baselineTime = baselineFirst ? first : second;
    const candidateTime = baselineFirst ? second : first;
    ratios.push(candidateTime / baselineTime);
  }
  void benchmarkSink;
  return median(ratios);
}

const zeroWorkPlugins = Array.from({length: 5}, (_, index) =>
  createMarkdownPlugin({
    name: `zero-work-${index}`,
    apiVersion: 1,
    transform: createMarkdownTextTransform({
      pattern: new RegExp(`NEVER_MATCH_${index}`, 'g'),
      requiredSubstrings: [`NEVER_MATCH_${index}`],
      replace: () => {
        throw new Error('An unclaimed helper callback ran');
      },
    }),
  }),
);

describe('Markdown helper performance', () => {
  it.each([200, 500])(
    'keeps five hinted no-claim helpers within a 1.15 ratio at %i sections',
    sections => {
      const source = benchmarkDocument(sections);
      const stableRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () => parseMarkdown(source, {plugins: zeroWorkPlugins}).length,
      );
      const recreatedRatio = pairedMedianRatio(
        () => parseMarkdown(source).length,
        () => parseMarkdown(source, {plugins: [...zeroWorkPlugins]}).length,
      );
      console.log(
        `  ${sections} sections, zero-work ratios: stable ${stableRatio.toFixed(3)}, recreated ${recreatedRatio.toFixed(3)}`,
      );
      expect(stableRatio).toBeLessThanOrEqual(1.15);
      expect(recreatedRatio).toBeLessThanOrEqual(1.15);
    },
  );
});
