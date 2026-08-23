// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
} from './parser';
import type {BlockNode, ParseOptions} from './parser';

function generateAIResponse(paragraphs: number): string {
  const sections: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    const mod = i % 6;
    switch (mod) {
      case 0:
        sections.push(
          `## Section ${i + 1}\n\nThis is paragraph ${i + 1} of the AI response. It contains analysis about the data and provides context for the following sections.`,
        );
        break;
      case 1:
        sections.push(
          '```typescript\nfunction process(data: Record<string, unknown>[]) {\n  return data.filter(item => item.valid)\n    .map(item => transform(item))\n    .reduce((acc, val) => merge(acc, val), {});\n}\n```',
        );
        break;
      case 2:
        sections.push(
          `- First point about topic ${i}\n- Second important finding\n- Third observation with **bold emphasis**\n- Fourth conclusion`,
        );
        break;
      case 3:
        sections.push(
          `| Metric | Value | Change |\n| :--- | :---: | ---: |\n| Accuracy | ${90 + (i % 10)}% | +${i % 5}% |\n| Latency | ${10 + i}ms | -${i % 3}ms |`,
        );
        break;
      case 4:
        sections.push(
          `> **Note:** This is an important observation about item ${i}.\n> It spans multiple lines and contains *italic* text.`,
        );
        break;
      case 5:
        sections.push(
          `1. Step one of process ${i}\n2. Step two with \`inline code\`\n3. Final step with [link](https://example.com/${i})`,
        );
        break;
    }
  }
  return sections.join('\n\n');
}

function simulateStreamingFullReparse(
  fullText: string,
  chunkSize = 50,
): BlockNode[] {
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    parseMarkdown(fullText.slice(0, i));
  }
  return parseMarkdown(fullText);
}

function simulateStreamingIncremental(
  fullText: string,
  chunkSize = 50,
): BlockNode[] {
  const state = createIncrementalState();
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    parseMarkdownIncremental(fullText.slice(0, i), state);
  }
  return parseMarkdownIncremental(fullText, state);
}

/**
 * How many blocks each chunk of a streamed document had to build.
 *
 * A block the parser kept in its settled cache is handed back as the very same
 * object, so a returned block that is not one of the previous chunk's is one
 * this chunk built. That makes the cache countable without reaching into the
 * parser's internals.
 */
function blocksBuiltPerChunk(
  fullText: string,
  chunkSize: number,
  options?: ParseOptions,
): number[] {
  const state = createIncrementalState();
  let previous: ReadonlySet<BlockNode> = new Set();
  const built: number[] = [];
  const step = (text: string) => {
    const blocks =
      options == null
        ? parseMarkdownIncremental(text, state)
        : parseMarkdownIncremental(text, state, options);
    built.push(blocks.reduce((n, b) => (previous.has(b) ? n : n + 1), 0));
    previous = new Set(blocks);
  };
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    step(fullText.slice(0, i));
  }
  step(fullText);
  return built;
}

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) / 2)];

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

// A single wall-clock measurement is flaky when the whole suite runs in
// parallel forks: scheduler contention can inflate a millisecond-scale
// sample well past a tight budget (observed 30.9ms against the 20ms Small
// budget). The fastest of a few runs approximates the un-contended cost —
// a real regression raises the minimum too — so budgets stay tight without
// flapping. The streaming budget tests below keep a single run: their
// budgets carry 10x+ headroom, which contention cannot realistically eat.
function measureBest<T>(
  runs: number,
  fn: () => T,
): {elapsed: number; result: T} {
  let elapsed = Infinity;
  let result!: T;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const r = fn();
    const t = performance.now() - start;
    if (t < elapsed) {
      elapsed = t;
      result = r;
    }
  }
  return {elapsed, result};
}

describe('parseMarkdown performance', () => {
  const sizes = [
    {name: 'Small', paragraphs: 10, maxMs: 20},
    {name: 'Medium', paragraphs: 50, maxMs: 50},
    {name: 'Large', paragraphs: 200, maxMs: 100},
    {name: 'XL', paragraphs: 500, maxMs: 400},
    {name: 'XXL', paragraphs: 2000, maxMs: 1000},
  ];

  // Report sizes
  it('reports input sizes', () => {
    for (const size of sizes) {
      const text = generateAIResponse(size.paragraphs);
      const lines = text.split('\n').length;
      console.log(
        `${size.name} (${size.paragraphs} paragraphs): ${text.length} chars, ${lines} lines`,
      );
    }
  });

  // Full re-parse benchmarks
  for (const size of sizes) {
    it(
      `full re-parse ${size.name} (${size.paragraphs} paragraphs) under ${size.maxMs}ms`,
      () => {
        const text = generateAIResponse(size.paragraphs);
        const {elapsed, result} = measureBest(3, () => parseMarkdown(text));
        console.log(
          `  ${size.name} full parse: ${elapsed.toFixed(2)}ms → ${result.length} blocks`,
        );
        expect(elapsed).toBeLessThan(size.maxMs);
        expect(result.length).toBeGreaterThan(0);
      },
      size.maxMs + 5000,
    );
  }

  // Streaming with full re-parse
  for (const size of [
    {name: 'Medium', paragraphs: 50, maxMs: 5000},
    {name: 'XL', paragraphs: 500, maxMs: 30000},
  ]) {
    it(
      `streaming full re-parse ${size.name} under ${size.maxMs}ms`,
      () => {
        const text = generateAIResponse(size.paragraphs);
        const chunkSize = 50;
        const iterations = Math.ceil(text.length / chunkSize);
        const start = performance.now();
        const result = simulateStreamingFullReparse(text, chunkSize);
        const elapsed = performance.now() - start;
        console.log(
          `  ${size.name} streaming full re-parse: ${elapsed.toFixed(2)}ms (${iterations} iterations)`,
        );
        expect(elapsed).toBeLessThan(size.maxMs);
        expect(result.length).toBeGreaterThan(0);
      },
      size.maxMs + 5000,
    );
  }

  // Streaming with incremental parse
  for (const size of [
    {name: 'Medium', paragraphs: 50, maxMs: 5000},
    {name: 'XL', paragraphs: 500, maxMs: 30000},
  ]) {
    it(
      `streaming incremental ${size.name} under ${size.maxMs}ms`,
      () => {
        const text = generateAIResponse(size.paragraphs);
        const chunkSize = 50;
        const iterations = Math.ceil(text.length / chunkSize);
        const start = performance.now();
        const result = simulateStreamingIncremental(text, chunkSize);
        const elapsed = performance.now() - start;
        console.log(
          `  ${size.name} streaming incremental: ${elapsed.toFixed(2)}ms (${iterations} iterations)`,
        );
        expect(elapsed).toBeLessThan(size.maxMs);
        expect(result.length).toBeGreaterThan(0);
      },
      size.maxMs + 5000,
    );
  }

  // --- Incremental vs Full speedup benchmark ---
  it('incremental parse is faster than full re-parse for streaming', () => {
    const text = generateAIResponse(200);
    const chunkSize = 50;

    // The assertion below compares a ratio of two measurements, so noise on
    // either side can flip it — measure both as best-of-3.
    const {elapsed: fullElapsed} = measureBest(3, () =>
      simulateStreamingFullReparse(text, chunkSize),
    );
    const {elapsed: incrElapsed} = measureBest(3, () =>
      simulateStreamingIncremental(text, chunkSize),
    );

    const speedup = fullElapsed / incrElapsed;
    console.log(`\n  === Incremental vs Full Re-parse Speedup ===`);
    console.log(`  Input: ${text.length} chars, chunk size: ${chunkSize}`);
    console.log(`  Full re-parse:  ${fullElapsed.toFixed(2)}ms`);
    console.log(`  Incremental:    ${incrElapsed.toFixed(2)}ms`);
    console.log(`  Speedup ratio:  ${speedup.toFixed(2)}x\n`);

    // Incremental should be at least as fast (allowing small margin for noise)
    expect(incrElapsed).toBeLessThanOrEqual(fullElapsed * 1.1);
  });
});

// What the incremental parser exists for is a cache, so these assert the cache:
// integers that come out the same on a loaded CI box as on an idle laptop,
// unlike the wall-clock budgets above.
describe('parseMarkdownIncremental cache', () => {
  it('builds a bounded number of blocks per chunk however long the document is', () => {
    const chunkSize = 50;
    const medians = [50, 200, 500].map(paragraphs =>
      median(blocksBuiltPerChunk(generateAIResponse(paragraphs), chunkSize)),
    );
    console.log(
      `  median blocks built per chunk (50/200/500 paragraphs): ${medians.join('/')}`,
    );
    // A chunk re-parses its unsettled tail, not the document — so the typical
    // chunk's cost is a constant, and a 10x longer document does not move it.
    expect(medians).toEqual([2, 2, 2]);
  });

  it('keeps the cache when source ranges are asked for', () => {
    const text = generateAIResponse(200);
    const chunkSize = 50;
    const without = sum(blocksBuiltPerChunk(text, chunkSize));
    const withRanges = sum(
      blocksBuiltPerChunk(text, chunkSize, {sourceRanges: true}),
    );
    console.log(
      `  blocks built streaming ${text.length} chars: ${without} without ranges, ${withRanges} with`,
    );
    // Stamping offsets must not cost a cache entry. An implementation that
    // tracked positions by invalidating the settled cache each chunk would
    // still pass any time budget generous enough not to flake; it fails here.
    expect(withRanges).toBe(without);
  });
});
