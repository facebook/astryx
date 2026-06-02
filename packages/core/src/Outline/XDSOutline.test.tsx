// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSOutline.test.tsx
 * @input Uses vitest, @testing-library/react, XDSOutline, outline hooks/utils
 * @output Unit tests for Outline rendering, scroll-spy behavior, and extraction helpers
 * @position Testing; validates Outline implementation
 *
 * SYNC: When modified, update this header
 */

import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSOutline} from './XDSOutline';
import {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
import {useOutlineFromDOM} from './useOutlineFromDOM';
import type {OutlineItem} from './types';

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
}

// Mock MutationObserver for jsdom
class MockMutationObserver {
  callback: MutationCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }
}

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
vi.stubGlobal('MutationObserver', MockMutationObserver);
vi.stubGlobal('ResizeObserver', MockResizeObserver);

const items: OutlineItem[] = [
  {id: 'intro', label: 'Introduction', level: 2},
  {id: 'install', label: 'Installation', level: 3},
  {id: 'api', label: 'API', level: 3},
];

describe('parseOutlineFromMarkdown', () => {
  it('extracts headings with generated ids', () => {
    expect(parseOutlineFromMarkdown('# Intro\n\n## Getting Started')).toEqual([
      {id: 'intro', label: 'Intro', level: 1},
      {id: 'getting-started', label: 'Getting Started', level: 2},
    ]);
  });

  it('uses rendered inline text and ignores fenced code headings', () => {
    expect(
      parseOutlineFromMarkdown(
        '## **Install** `@xds/core`\n\n```\n# Not a heading\n```',
      ),
    ).toEqual([{id: 'install-xds-core', label: 'Install @xds/core', level: 2}]);
  });

  it('deduplicates generated ids', () => {
    expect(parseOutlineFromMarkdown('## Usage\n## Usage\n## Usage')).toEqual([
      {id: 'usage', label: 'Usage', level: 2},
      {id: 'usage-1', label: 'Usage', level: 2},
      {id: 'usage-2', label: 'Usage', level: 2},
    ]);
  });
});

describe('XDSOutline', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    // Mock window.scrollTo
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a labelled nav with anchor links', () => {
    render(<XDSOutline items={items} label="On this page" />);
    expect(
      screen.getByRole('navigation', {name: 'On this page'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Introduction'})).toHaveAttribute(
      'href',
      '#intro',
    );
  });

  it('uses the default accessible label', () => {
    render(<XDSOutline items={items} />);
    expect(
      screen.getByRole('navigation', {name: 'Table of contents'}),
    ).toBeInTheDocument();
  });

  it('marks the controlled active item with aria-current', () => {
    render(<XDSOutline items={items} activeId="install" />);
    expect(screen.getByRole('link', {name: 'Installation'})).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      screen.getByRole('link', {name: 'Introduction'}),
    ).not.toHaveAttribute('aria-current');
  });

  it('smooth-scrolls and reports active id on click', async () => {
    const user = userEvent.setup();
    const target = document.createElement('h2');
    target.id = 'install';
    document.body.appendChild(target);
    const onActiveIdChange = vi.fn();

    render(<XDSOutline items={items} onActiveIdChange={onActiveIdChange} />);
    await user.click(screen.getByRole('link', {name: 'Installation'}));

    expect(window.scrollTo).toHaveBeenCalled();
    expect(onActiveIdChange).toHaveBeenCalledWith('install');

    document.body.removeChild(target);
  });

  it('does not scroll when hasScrollOnClick is false', async () => {
    const user = userEvent.setup();
    const target = document.createElement('h2');
    target.id = 'install';
    document.body.appendChild(target);
    const onActiveIdChange = vi.fn();

    render(
      <XDSOutline
        items={items}
        hasScrollOnClick={false}
        onActiveIdChange={onActiveIdChange}
      />,
    );
    await user.click(screen.getByRole('link', {name: 'Installation'}));

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(onActiveIdChange).toHaveBeenCalledWith('install');

    document.body.removeChild(target);
  });

  it('applies stable root and item class names', () => {
    render(<XDSOutline items={items} data-testid="outline" activeId="api" />);
    expect(screen.getByTestId('outline').className).toContain('xds-outline');
    expect(screen.getByRole('link', {name: 'API'}).className).toContain(
      'xds-outline-item',
    );
    expect(screen.getByRole('link', {name: 'API'}).className).toContain(
      'active',
    );
    expect(screen.getByRole('link', {name: 'API'}).className).toContain(
      'level-3',
    );
  });

  it('renders with size="sm"', () => {
    render(<XDSOutline items={items} size="sm" data-testid="outline-sm" />);
    expect(screen.getByTestId('outline-sm').className).toContain('sm');
  });

  it('renders with size="md" by default', () => {
    render(<XDSOutline items={items} data-testid="outline-md" />);
    expect(screen.getByTestId('outline-md').className).toContain('md');
  });

  it('renders the sliding indicator track', () => {
    const {container} = render(<XDSOutline items={items} activeId="intro" />);
    // Track is present as an aria-hidden div
    const track = container.querySelector('[aria-hidden="true"]');
    expect(track).toBeInTheDocument();
  });

  it('sizes the indicator to the active item height and updates on size change', () => {
    // jsdom does not lay out, so drive measurement via getBoundingClientRect.
    // Heights differ by size variant; the active item reports the size-specific
    // height and the list reports 0 so indicator.top === item.top.
    const heightForSize = (size: string) => (size === 'sm' ? 28 : 36);

    function mockRects(size: string) {
      const itemHeight = heightForSize(size);
      vi.spyOn(
        HTMLElement.prototype,
        'getBoundingClientRect',
      ).mockImplementation(function (this: HTMLElement) {
        // The list <ul> anchors the coordinate space at the top.
        if (this.tagName === 'UL') {
          return {top: 0, left: 0, height: 0, width: 0} as DOMRect;
        }
        // Anchor links report the size-specific item height.
        return {top: 0, left: 0, height: itemHeight, width: 0} as DOMRect;
      });
    }

    mockRects('md');
    const {container, rerender} = render(
      <XDSOutline items={items} activeId="intro" />,
    );

    const indicator = container.querySelector('.xds-outline-indicator');
    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.height).toBe('36px');

    // Switching to sm shrinks the rendered item; indicator must follow.
    mockRects('sm');
    rerender(<XDSOutline items={items} activeId="intro" size="sm" />);
    expect((indicator as HTMLElement).style.height).toBe('28px');

    vi.restoreAllMocks();
  });

  it('re-measures the indicator when the active item reflows (ResizeObserver)', () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    const observeSpy = vi.fn();

    class CapturingResizeObserver {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
    }
    vi.stubGlobal('ResizeObserver', CapturingResizeObserver);

    let currentHeight = 36;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.tagName === 'UL') {
          return {top: 0, left: 0, height: 0, width: 0} as DOMRect;
        }
        return {top: 0, left: 0, height: currentHeight, width: 0} as DOMRect;
      },
    );

    const {container} = render(<XDSOutline items={items} activeId="intro" />);
    const indicator = container.querySelector('.xds-outline-indicator');
    expect((indicator as HTMLElement).style.height).toBe('36px');

    // Label wraps → taller box. Fire the ResizeObserver callback.
    currentHeight = 54;
    act(() => {
      resizeCallback?.([], {} as ResizeObserver);
    });
    expect((indicator as HTMLElement).style.height).toBe('54px');

    vi.restoreAllMocks();
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
  });

  it('fires onNavigateStart and onNavigateEnd callbacks', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    const target = document.createElement('h2');
    target.id = 'install';
    document.body.appendChild(target);

    const onNavigateStart = vi.fn();
    const onNavigateEnd = vi.fn();

    render(
      <XDSOutline
        items={items}
        onNavigateStart={onNavigateStart}
        onNavigateEnd={onNavigateEnd}
      />,
    );
    await user.click(screen.getByRole('link', {name: 'Installation'}));

    expect(onNavigateStart).toHaveBeenCalledWith('install');
    expect(onNavigateEnd).not.toHaveBeenCalled();

    // Advance past scroll settle timeout
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(onNavigateEnd).toHaveBeenCalledWith('install');

    document.body.removeChild(target);
    vi.useRealTimers();
  });

  it('preserves the legacy controlled API (items + activeId + onActiveIdChange)', () => {
    // Regression guard: the pre-refresh public API must keep working unchanged.
    const onActiveIdChange = vi.fn();
    const {rerender} = render(
      <XDSOutline
        items={items}
        activeId="intro"
        onActiveIdChange={onActiveIdChange}
      />,
    );

    expect(screen.getByRole('link', {name: 'Introduction'})).toHaveAttribute(
      'aria-current',
      'true',
    );

    // Controlled active id is driven entirely by the prop.
    rerender(
      <XDSOutline
        items={items}
        activeId="api"
        onActiveIdChange={onActiveIdChange}
      />,
    );
    expect(screen.getByRole('link', {name: 'API'})).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      screen.getByRole('link', {name: 'Introduction'}),
    ).not.toHaveAttribute('aria-current');
  });

  it('supports keyboard navigation with Enter', () => {
    const target = document.createElement('h2');
    target.id = 'install';
    document.body.appendChild(target);
    const onActiveIdChange = vi.fn();

    render(
      <XDSOutline
        items={items}
        activeId="intro"
        onActiveIdChange={onActiveIdChange}
      />,
    );

    const link = screen.getByRole('link', {name: 'Installation'});
    fireEvent.keyDown(link, {key: 'Enter'});

    expect(onActiveIdChange).toHaveBeenCalledWith('install');

    document.body.removeChild(target);
  });
});

describe('useOutlineFromDOM', () => {
  it('collects headings from DOM container', () => {
    function Demo() {
      const ref = useRef<HTMLElement | null>(null);
      const outlineItems = useOutlineFromDOM(ref);

      return (
        <>
          <article ref={ref}>
            <h2 id="intro">Intro</h2>
            <h3 id="details">Details</h3>
          </article>
          <output>
            {outlineItems
              .map(item => `${item.level}:${item.id}:${item.label}`)
              .join('|')}
          </output>
        </>
      );
    }

    render(<Demo />);
    expect(
      screen.getByText('2:intro:Intro|3:details:Details'),
    ).toBeInTheDocument();
  });
});
