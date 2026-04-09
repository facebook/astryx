import {describe, it, expect} from 'vitest';
import {parseMarkdown, parseMarkdownIncremental, createIncrementalState} from './parser';
import type {BlockNode} from './parser';

function generateAIResponse(paragraphs: number): string {
  const sections: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    const mod = i % 6;
    switch (mod) {
      case 0:
        sections.push(`## Section ${i + 1}\n\nThis is paragraph ${i + 1} of the AI response. It contains analysis about the data and provides context for the following sections.`);
        break;
      case 1:
        sections.push('```typescript\nfunction process(data: Record<string, unknown>[]) {\n  return data.filter(item => item.valid)\n    .map(item => transform(item))\n    .reduce((acc, val) => merge(acc, val), {});\n}\n```');
        break;
      case 2:
        sections.push(`- First point about topic ${i}\n- Second important finding\n- Third observation with **bold emphasis**\n- Fourth conclusion`);
        break;
      case 3:
        sections.push(`| Metric | Value | Change |\n| :--- | :---: | ---: |\n| Accuracy | ${90 + (i % 10)}% | +${i % 5}% |\n| Latency | ${10 + i}ms | -${i % 3}ms |`);
        break;
      case 4:
        sections.push(`> **Note:** This is an important observation about item ${i}.\n> It spans multiple lines and contains *italic* text.`);
        break;
      case 5:
        sections.push(`1. Step one of process ${i}\n2. Step two with \`inline code\`\n3. Final step with [link](https://example.com/${i})`);
        break;
    }
  }
  return sections.join('\n\n');
}

function simulateStreamingFullReparse(fullText: string, chunkSize = 50): BlockNode[] {
  let result: BlockNode[] = [];
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    result = parseMarkdown(fullText.slice(0, i));
  }
  result = parseMarkdown(fullText);
  return result;
}

function simulateStreamingIncremental(fullText: string, chunkSize = 50): BlockNode[] {
  const state = createIncrementalState();
  let result: BlockNode[] = [];
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    result = parseMarkdownIncremental(fullText.slice(0, i), state);
  }
  result = parseMarkdownIncremental(fullText, state);
  return result;
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
      console.log(`${size.name} (${size.paragraphs} paragraphs): ${text.length} chars, ${lines} lines`);
    }
  });

  // Full re-parse benchmarks
  for (const size of sizes) {
    it(`full re-parse ${size.name} (${size.paragraphs} paragraphs) under ${size.maxMs}ms`, () => {
      const text = generateAIResponse(size.paragraphs);
      const start = performance.now();
      const result = parseMarkdown(text);
      const elapsed = performance.now() - start;
      console.log(`  ${size.name} full parse: ${elapsed.toFixed(2)}ms → ${result.length} blocks`);
      expect(elapsed).toBeLessThan(size.maxMs);
      expect(result.length).toBeGreaterThan(0);
    });
  }

  // Streaming with full re-parse
  for (const size of [{name: 'Medium', paragraphs: 50, maxMs: 5000}, {name: 'XL', paragraphs: 500, maxMs: 30000}]) {
    it(`streaming full re-parse ${size.name} under ${size.maxMs}ms`, () => {
      const text = generateAIResponse(size.paragraphs);
      const chunkSize = 50;
      const iterations = Math.ceil(text.length / chunkSize);
      const start = performance.now();
      const result = simulateStreamingFullReparse(text, chunkSize);
      const elapsed = performance.now() - start;
      console.log(`  ${size.name} streaming full re-parse: ${elapsed.toFixed(2)}ms (${iterations} iterations)`);
      expect(elapsed).toBeLessThan(size.maxMs);
      expect(result.length).toBeGreaterThan(0);
    });
  }

  // Streaming with incremental parse
  for (const size of [{name: 'Medium', paragraphs: 50, maxMs: 5000}, {name: 'XL', paragraphs: 500, maxMs: 30000}]) {
    it(`streaming incremental ${size.name} under ${size.maxMs}ms`, () => {
      const text = generateAIResponse(size.paragraphs);
      const chunkSize = 50;
      const iterations = Math.ceil(text.length / chunkSize);
      const start = performance.now();
      const result = simulateStreamingIncremental(text, chunkSize);
      const elapsed = performance.now() - start;
      console.log(`  ${size.name} streaming incremental: ${elapsed.toFixed(2)}ms (${iterations} iterations)`);
      expect(elapsed).toBeLessThan(size.maxMs);
      expect(result.length).toBeGreaterThan(0);
    });
  }

  // --- Incremental vs Full speedup benchmark ---
  it('incremental parse is faster than full re-parse for streaming', () => {
    const text = generateAIResponse(200);
    const chunkSize = 50;

    // Full re-parse timing
    const fullStart = performance.now();
    simulateStreamingFullReparse(text, chunkSize);
    const fullElapsed = performance.now() - fullStart;

    // Incremental timing
    const incrStart = performance.now();
    simulateStreamingIncremental(text, chunkSize);
    const incrElapsed = performance.now() - incrStart;

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
