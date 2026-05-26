// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSOutline.test.tsx
 * @input Uses vitest, @testing-library/react, XDSOutline, outline hooks/utils
 * @output Unit tests for Outline rendering, scroll-spy behavior, and extraction helpers
 * @position Testing; validates Outline implementation
 *
 * SYNC: When modified, update this header
 */

import {useRef, useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSOutline} from './XDSOutline';
import {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
import {useOutlineFromDOM} from './useOutlineFromDOM';
import type {OutlineItem} from './types';

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

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(onActiveIdChange).toHaveBeenCalledWith('install');
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

  it('updates uncontrolled active id from IntersectionObserver', () => {
    let observerCallback: IntersectionObserverCallback | undefined;

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();

      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const intro = document.createElement('h2');
    intro.id = 'intro';
    const api = document.createElement('h3');
    api.id = 'api';
    document.body.append(intro, api);

    const onActiveIdChange = vi.fn();
    render(<XDSOutline items={items} onActiveIdChange={onActiveIdChange} />);

    const entry: IntersectionObserverEntry = {
      target: api,
      isIntersecting: true,
      boundingClientRect: {top: 12} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    };

    act(() => {
      observerCallback?.([entry], {} as IntersectionObserver);
    });

    expect(screen.getByRole('link', {name: 'API'})).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(onActiveIdChange).toHaveBeenCalledWith('api');
  });
});

describe('useOutlineFromDOM', () => {
  it('collects headings and updates after mutations', async () => {
    const user = userEvent.setup();

    function Demo() {
      const ref = useRef<HTMLElement | null>(null);
      const [showDetails, setShowDetails] = useState(false);
      const outlineItems = useOutlineFromDOM(ref);

      return (
        <>
          <button type="button" onClick={() => setShowDetails(true)}>
            Show
          </button>
          <article ref={ref}>
            <h2 id="intro">Intro</h2>
            {showDetails ? <h3 id="details">Details</h3> : null}
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
    await waitFor(() => {
      expect(screen.getByText('2:intro:Intro')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: 'Show'}));
    await waitFor(() => {
      expect(
        screen.getByText('2:intro:Intro|3:details:Details'),
      ).toBeInTheDocument();
    });
  });
});
