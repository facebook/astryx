// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.plugins.perf.test.ts
 * @input Canonical Markdown text plugins and prepared text dispatch
 * @output Deterministic work bounds and wall-clock regression budgets
 * @position Focused performance coverage for Markdown plugin text application
 */

import {describe, expect, it} from 'vitest';
import {applyTextContributions} from './Markdown';
import {parseMarkdown} from './parser';
import type {BlockNode, InlineNode} from './parser';
import {createMarkdownPlugin, prepareMarkdownPlugins} from './plugins';
import type {MarkdownPluginEntry, PreparedTextDispatch} from './plugins';

class CountingRegExp extends RegExp {
  executions = 0;

  override exec(value: string): RegExpExecArray | null {
    this.executions++;
    return super.exec(value);
  }
}

function prepareText(
  plugins: ReadonlyArray<MarkdownPluginEntry>,
): PreparedTextDispatch {
  const text = prepareMarkdownPlugins(plugins)?.text;
  if (text == null) {
    throw new Error('Expected prepared text contributions');
  }
  return text;
}

function generateParagraphs(count: number, withMatches = false): string[] {
  return Array.from({length: count}, (_, index) =>
    withMatches
      ? `Section ${index}: AST-${index} is assigned to @{owner-${index}} with TODO follow-up.`
      : `Section ${index}: ordinary prose stays readable without an extension marker.`,
  );
}

function measureBest(runs: number, callback: () => void): number {
  let best = Infinity;
  for (let run = 0; run < runs; run++) {
    const start = performance.now();
    callback();
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

function applyParagraphs(
  paragraphs: ReadonlyArray<string>,
  text: PreparedTextDispatch,
): void {
  for (const paragraph of paragraphs) {
    applyTextContributions(paragraph, text);
  }
}

function generateBenchmarkDocument(
  sections: number,
  withMatches = false,
): string {
  const prose = (index: number) =>
    withMatches && index % 10 === 0
      ? `AST-${index} belongs to @{owner-${index}} with TODO follow-up.`
      : `Section ${index} contains ordinary prose without an extension marker.`;
  return Array.from({length: sections}, (_, index) => {
    switch (index % 6) {
      case 0:
        return `## Section ${index}\n\n${prose(index)}`;
      case 1:
        return `- ${prose(index)}\n- A second list item`;
      case 2:
        return `> ${prose(index)}`;
      case 3:
        return `| Item | Detail |\n| --- | --- |\n| ${index} | ${prose(index)} |`;
      case 4:
        return `\`\`\`text\n${prose(index)}\n\`\`\``;
      default:
        return prose(index);
    }
  }).join('\n\n');
}

function visitInlineNodes(
  nodes: ReadonlyArray<InlineNode>,
  text?: PreparedTextDispatch,
): number {
  let length = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        length += node.content.length;
        if (text != null) {
          applyTextContributions(node.content, text);
        }
        break;
      case 'bold':
      case 'italic':
      case 'strikethrough':
        length += visitInlineNodes(node.children, text);
        break;
      case 'link':
        // Canonical text contributions do not enter protected link children.
        length += visitInlineNodes(node.children);
        break;
      case 'code':
        length += node.content.length;
        break;
      case 'image':
        length += node.alt.length;
        break;
      case 'citation':
        length += node.sourceId.length;
        break;
      case 'break':
        length++;
        break;
    }
  }
  return length;
}

function visitBlocks(
  blocks: ReadonlyArray<BlockNode>,
  text?: PreparedTextDispatch,
): number {
  let length = 0;
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
        length += visitInlineNodes(block.children, text);
        break;
      case 'blockquote':
        length += visitBlocks(block.children, text);
        break;
      case 'list':
        for (const item of block.items) {
          length += visitBlocks(item.children, text);
        }
        break;
      case 'table':
        for (const cell of [...block.headers, ...block.rows.flat()]) {
          length += visitInlineNodes(cell.children, text);
        }
        break;
      case 'codeblock':
        length += block.content.length;
        break;
      case 'image':
        length += block.alt.length;
        break;
      case 'hr':
        break;
    }
  }
  return length;
}

let benchmarkSink = 0;

function overheadRatio(
  source: string,
  text: PreparedTextDispatch,
): {baseline: number; dispatch: number; ratio: number} {
  const blocks = parseMarkdown(source);
  const baseline = measureBest(10, () => {
    benchmarkSink ^= parseMarkdown(source).length;
  });
  const dispatch = measureBest(10, () => {
    benchmarkSink ^= visitBlocks(blocks, text);
  });
  void benchmarkSink;
  return {baseline, dispatch, ratio: (baseline + dispatch) / baseline};
}

describe('Markdown text plugin performance', () => {
  it('reuses preparation for a stable ordered plugin list', () => {
    const plugins = Array.from({length: 5}, (_, index) =>
      createMarkdownPlugin({
        name: `stable-${index}`,
        apiVersion: 1,
        text: [
          {
            pattern: new RegExp(`STABLE_${index}`, 'g'),
            render: match => match[0],
          },
        ],
      }),
    );

    expect(prepareMarkdownPlugins(plugins)).toBe(
      prepareMarkdownPlugins(plugins),
    );
    const elapsed = measureBest(5, () => {
      for (let index = 0; index < 1000; index++) {
        prepareMarkdownPlugins([...plugins]);
      }
    });
    console.log(
      `  1,000 cold five-plugin preparations: ${elapsed.toFixed(2)}ms`,
    );
    expect(elapsed).toBeLessThan(100);
  });

  it.each([200, 500])(
    'keeps five zero-work plugins within 15% of the %i-section baseline',
    sections => {
      const plugins = Array.from({length: 5}, (_, index) =>
        createMarkdownPlugin({
          name: `render-zero-work-${index}`,
          apiVersion: 1,
          text: [
            {
              pattern: new RegExp(`NEVER_${index}`, 'g'),
              render: match => match[0],
            },
          ],
        }),
      );
      const text = prepareText(plugins);
      const result = overheadRatio(generateBenchmarkDocument(sections), text);
      console.log(
        `  five zero-work plugins (${sections} sections): ${result.baseline.toFixed(2)}ms parse + ${result.dispatch.toFixed(2)}ms dispatch (${result.ratio.toFixed(2)}x)`,
      );
      expect(result.ratio).toBeLessThanOrEqual(1.15);
    },
  );

  it.each([200, 500])(
    'keeps realistic text callbacks within 25% of the %i-section baseline',
    sections => {
      const render = (match: RegExpMatchArray): string => match[0];
      const plugins = [
        createMarkdownPlugin({
          name: 'render-issues',
          apiVersion: 1,
          text: [{pattern: /AST-\d+/g, render}],
        }),
        createMarkdownPlugin({
          name: 'render-mentions',
          apiVersion: 1,
          text: [{pattern: /@\{[^}]+\}/g, render}],
        }),
        createMarkdownPlugin({
          name: 'render-follow-ups',
          apiVersion: 1,
          text: [{pattern: /\b(?:TODO|FIXME)\b/g, render}],
        }),
      ];
      const text = prepareText(plugins);
      const result = overheadRatio(
        generateBenchmarkDocument(sections, true),
        text,
      );
      console.log(
        `  three matching plugins (${sections} sections): ${result.baseline.toFixed(2)}ms parse + ${result.dispatch.toFixed(2)}ms dispatch (${result.ratio.toFixed(2)}x)`,
      );
      expect(result.ratio).toBeLessThanOrEqual(1.25);
    },
  );

  it('prefilters five zero-work plugins once per text node', () => {
    const patterns = Array.from(
      {length: 5},
      (_, index) => new CountingRegExp(`NEVER_${index}`, 'g'),
    );
    const plugins = patterns.map((pattern, index) =>
      createMarkdownPlugin({
        name: `zero-work-${index}`,
        apiVersion: 1,
        text: [{pattern, render: match => match[0]}],
      }),
    );
    const text = prepareText(plugins);

    applyParagraphs(generateParagraphs(500), text);

    expect(text.guards).toHaveLength(1);
    expect(text.unguarded).toHaveLength(0);
    expect(patterns.map(pattern => pattern.executions)).toEqual([
      0, 0, 0, 0, 0,
    ]);
  });

  it('keeps zero-work dispatch bounded for 200 and 500 sections', () => {
    const plugins = Array.from({length: 5}, (_, index) =>
      createMarkdownPlugin({
        name: `zero-work-${index}`,
        apiVersion: 1,
        text: [
          {
            pattern: new RegExp(`NEVER_${index}`, 'g'),
            render: match => match[0],
          },
        ],
      }),
    );
    const text = prepareText(plugins);
    const short = generateParagraphs(200);
    const long = generateParagraphs(500);

    applyParagraphs(long, text);
    const shortMs = measureBest(5, () => applyParagraphs(short, text));
    const longMs = measureBest(5, () => applyParagraphs(long, text));

    console.log(
      `  five zero-work text plugins (200/500 sections): ${shortMs.toFixed(2)}ms / ${longMs.toFixed(2)}ms`,
    );
    expect(longMs).toBeLessThan(50);
    expect(longMs).toBeLessThan(shortMs * 4 + 1);
  });

  it('keeps realistic callbacks inside a focused 500-section budget', () => {
    let renders = 0;
    const render = (match: RegExpMatchArray): string => {
      renders++;
      return match[0];
    };
    const text = prepareText([
      createMarkdownPlugin({
        name: 'issues',
        apiVersion: 1,
        text: [{pattern: /AST-\d+/g, render}],
      }),
      createMarkdownPlugin({
        name: 'mentions',
        apiVersion: 1,
        text: [{pattern: /@\{[^}]+\}/g, render}],
      }),
      createMarkdownPlugin({
        name: 'follow-ups',
        apiVersion: 1,
        text: [{pattern: /\b(?:TODO|FIXME)\b/g, render}],
      }),
    ]);
    const paragraphs = generateParagraphs(500, true);

    applyParagraphs(paragraphs, text);
    renders = 0;
    const elapsed = measureBest(5, () => {
      renders = 0;
      applyParagraphs(paragraphs, text);
    });

    console.log(
      `  three matching text plugins (500 sections, ${renders} callbacks): ${elapsed.toFixed(2)}ms`,
    );
    expect(renders).toBe(1500);
    expect(elapsed).toBeLessThan(100);
  });
});
