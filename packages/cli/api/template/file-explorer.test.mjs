// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Focused contract tests for the file-explorer page template
 * @input Reads the shipped single-file template source
 * @output Guards the multi-pane column layout (issue #2623)
 * @position CLI template regression coverage; runs in the node test project
 *
 * The Miller-column strip used to hand-write its flex and overflow CSS. It is
 * now expressed with StackItem sizing and Section `isScrollable`. jsdom cannot
 * lay out, so this pins the source shape that keeps the strip scrolling only
 * horizontally while every column scrolls on its own.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(dirname, '../../assets/templates/pages/file-explorer/page.tsx'),
  'utf8',
);

/** Every `<StackItem ...>` whose first child is a `<Section ...>`. */
function wrappedSections() {
  return [...source.matchAll(/<StackItem\b([^>]*)>\s*<Section\b([^>]*)>/g)].map(
    match => ({item: match[1], section: match[2]}),
  );
}

describe('file-explorer template contract', () => {
  it('expresses the column layout with props, not hand-written CSS', () => {
    for (const property of [
      'overflowX',
      'overflowY',
      'flexGrow',
      'flexShrink',
      'flexBasis',
    ]) {
      expect(source).not.toContain(property);
    }
  });

  it('scrolls the column strip itself', () => {
    expect(source).toMatch(/<HStack height="100%" isScrollable>/);
  });

  it('sizes each column with a StackItem around its Section', () => {
    const panes = wrappedSections();
    // The Miller columns (one JSX site, mapped) plus the detail pane.
    expect(panes).toHaveLength(2);
    const [column, detail] = panes;
    expect(column.item).toContain('size="static"');
    expect(column.section).toContain('width={240}');
    expect(detail.item).toContain('size="fill"');
    expect(detail.item).toContain('minWidth={320}');
  });

  it('bounds every scrollable Section to its StackItem with height="100%"', () => {
    // StackItem is a plain block box: without height="100%" the Section's
    // inner height:100% resolves to auto, the columns stop scrolling on
    // their own and the strip starts scrolling vertically instead.
    const panes = wrappedSections();
    expect(panes.length).toBeGreaterThan(0);
    for (const {section} of panes) {
      expect(section).toContain('isScrollable');
      expect(section).toContain('height="100%"');
    }
  });
});
