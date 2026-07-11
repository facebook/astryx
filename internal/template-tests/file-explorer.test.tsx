// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file file-explorer.test.tsx
 * @input Renders the file-explorer page template against the core source
 * @output Asserts the multi-pane layout is expressed with props, not raw CSS
 * @position Template regression test; guards the dogfood case for issue #2623
 *
 * The file-explorer template is the motivating case in #2623: a Miller-column
 * browser that used to hand-write `overflowX`/`overflowY`, `flexShrink` and
 * `flexGrow`/`flexBasis` as raw CSSProperties objects because Section/HStack
 * had no props for them. This test pins the behavior those raw styles used to
 * provide, now that they are expressed as props.
 *
 * SYNC: When /packages/cli/templates/pages/file-explorer/page.tsx changes,
 * update this test to match.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import FileExplorerPage from '../../packages/cli/templates/pages/file-explorer/page';
import pageSource from '../../packages/cli/templates/pages/file-explorer/page.tsx?raw';

/** The horizontally scrolling strip of Miller columns. */
function getColumnStrip(container: HTMLElement): HTMLElement {
  const strip = container.querySelector<HTMLElement>(
    '[class*="astryx-stack"][class*="horizontal"]',
  );
  if (strip == null) {
    throw new Error('column strip not found');
  }
  return strip;
}

/**
 * The panes of the strip. Sections render an outer box (the flex child)
 * wrapping an inner painted surface (padding, background, dividers) — both
 * matter here. Scoped to the strip: Toolbar renders a Section of its own.
 */
function getSectionBoxes(container: HTMLElement) {
  const inners = Array.from(
    getColumnStrip(container).querySelectorAll<HTMLElement>('.astryx-section'),
  );
  return inners.map(inner => ({
    inner,
    outer: inner.parentElement as HTMLElement,
  }));
}

describe('file-explorer template (dogfood for #2623)', () => {
  it('renders the Miller columns and the detail pane', () => {
    render(<FileExplorerPage />);
    expect(screen.getByText('Applications')).toBeInTheDocument();
    // A folder appears both in its parent column and as that column's heading
    // context, so these are inherently multi-match.
    expect(screen.getAllByText('Chrome Apps').length).toBeGreaterThan(0);
    // Default selection drills down to a file, so the detail pane is showing.
    expect(screen.getAllByText('Component Lab.app').length).toBeGreaterThan(0);
    expect(screen.getByText('Information')).toBeInTheDocument();
  });

  it('scrolls the column strip horizontally', () => {
    const {container} = render(<FileExplorerPage />);
    expect(getComputedStyle(getColumnStrip(container)).overflow).toBe('auto');
  });

  it('gives every column its own scroll region on the painted surface', () => {
    const {container} = render(<FileExplorerPage />);
    const sections = getSectionBoxes(container);
    expect(sections.length).toBeGreaterThan(1);
    for (const {inner} of sections) {
      expect(getComputedStyle(inner).overflow).toBe('auto');
    }
  });

  it('keeps the columns from being squeezed by the strip', () => {
    const {container} = render(<FileExplorerPage />);
    const [firstColumn] = getSectionBoxes(container);
    const outerStyle = firstColumn.outer.getAttribute('style') ?? '';
    expect(outerStyle).toContain('--x-flexShrink: 0');
    expect(outerStyle).toContain('--x-width: 240px');
    // A flex item that cannot shrink below its content cannot scroll.
    expect(getComputedStyle(firstColumn.outer).minHeight).toBe('0');
  });

  it('lets the detail column take the leftover space from a 320px basis', () => {
    const {container} = render(<FileExplorerPage />);
    const sections = getSectionBoxes(container);
    const detail = sections[sections.length - 1];
    const outerStyle = detail.outer.getAttribute('style') ?? '';
    expect(outerStyle).toContain('--x-flexGrow: 1');
    expect(outerStyle).toContain('--x-flexShrink: 0');
    expect(outerStyle).toContain('--x-flexBasis: 320px');
  });

  it('no longer hand-writes the layout CSS the props now cover', () => {
    for (const property of [
      'overflowX',
      'overflowY',
      'flexGrow',
      'flexShrink',
      'flexBasis',
    ]) {
      expect(pageSource).not.toContain(property);
    }
  });
});
