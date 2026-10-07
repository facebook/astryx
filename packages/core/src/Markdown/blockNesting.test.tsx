// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {Markdown} from './Markdown';
import {parseMarkdownAst} from './parser';

type Json = {type: string; value?: string; children?: Json[]};

/** A list nested `levels` deep by indentation, one item per level. */
const indentedList = (levels: number): string =>
  Array.from({length: levels}, (_, level) => `${'  '.repeat(level)}- a`).join(
    '\n',
  );

/** A list nested `levels` deep on one line: each item opens the next list. */
const nestedList = (levels: number, marker = '- '): string =>
  `${marker.repeat(levels)}a`;

/** A blockquote nested `levels` deep. */
const nestedQuote = (levels: number): string => `${'> '.repeat(levels)}a`;

/** Lists and blockquotes alternating `levels` deep, on one line. */
const mixed = (levels: number): string =>
  `${Array.from({length: levels}, (_, level) => (level % 2 === 0 ? '> ' : '- ')).join('')}a`;

/** The deepest run of lists and blockquotes, iteratively. */
function blockDepth(nodes: ReadonlyArray<Json>): number {
  let deepest = 0;
  const stack: {node: Json; depth: number}[] = nodes.map(node => ({
    node,
    depth: 0,
  }));
  while (stack.length > 0) {
    const {node, depth} = stack.pop() as {node: Json; depth: number};
    const next =
      node.type === 'list' || node.type === 'blockquote' ? depth + 1 : depth;
    deepest = Math.max(deepest, next);
    for (const child of node.children ?? []) {
      stack.push({node: child, depth: next});
    }
  }
  return deepest;
}

/** The fastest of three parses of `markdown`, in milliseconds. */
function parseTime(markdown: string): number {
  parseMarkdownAst(markdown);
  let fastest = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 3; round++) {
    const started = performance.now();
    parseMarkdownAst(markdown);
    fastest = Math.min(fastest, performance.now() - started);
  }
  return fastest;
}

describe('lists and blockquotes nest at most 100 deep', () => {
  it('nests a list 100 deep exactly, and reads deeper items as text', () => {
    const at = (levels: number) =>
      blockDepth(parseMarkdownAst(indentedList(levels)).children as never);
    expect(at(50)).toBe(50);
    expect(at(101)).toBe(101);
    expect(at(150)).toBe(101);
  });

  it.each([
    ['a list 2,000 deep', nestedList(2_000)],
    ['a list 10,000 deep', nestedList(10_000)],
    ['an ordered list 10,000 deep', nestedList(10_000, '1. ')],
    ['a list 500 deep by indentation', indentedList(500)],
    ['a blockquote 2,000 deep', nestedQuote(2_000)],
    ['a blockquote 10,000 deep', nestedQuote(10_000)],
    ['lists and blockquotes 10,000 deep', mixed(10_000)],
  ])('parses %s without throwing, within a time budget', (_, markdown) => {
    expect(() => parseMarkdownAst(markdown)).not.toThrow();
    const depth = blockDepth(parseMarkdownAst(markdown).children as never);
    expect(depth).toBeGreaterThan(50);
    expect(depth).toBeLessThanOrEqual(101);
    // The budget leaves room for a loaded test machine.
    expect(parseTime(markdown)).toBeLessThan(5000);
  });

  it.each([
    ['a list', nestedList(10_000)],
    ['a blockquote', nestedQuote(10_000)],
    ['lists and blockquotes', mixed(10_000)],
  ])(
    'renders %s nested past the cap without exhausting the stack',
    (_, markdown) => {
      const {container} = render(<Markdown>{markdown}</Markdown>);
      expect(container.textContent).toContain('a');
    },
  );
});
