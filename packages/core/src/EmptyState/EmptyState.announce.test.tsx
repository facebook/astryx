// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EmptyState.announce.test.tsx
 * @input A fresh EmptyState module with the page's first paint held back
 * @output Proves an EmptyState rendered with the page announces nothing and one
 *   that appears later announces its message once through the shared polite
 *   live region (spec:AST-086 FR2)
 * @position Component test for EmptyState's announcement
 */

import {act, StrictMode, useState} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {createRoot} from 'react-dom/client';

// Each test imports a fresh EmptyState with the first-paint frame held back, so
// a render before `paint()` is "with the page" and one after it is inserted.
async function importEmptyState() {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    frames.push(callback),
  );
  vi.resetModules();
  const {EmptyState} = await import('./EmptyState');
  vi.unstubAllGlobals();
  const paint = () => {
    frames.splice(0).forEach(callback => callback(performance.now()));
  };
  return {EmptyState, paint};
}

const nextFrame = async () =>
  new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/**
 * Every message written to the shared polite region, in order: one entry per
 * write, so writing the same words twice is recorded twice.
 */
function recordPolite() {
  const spoken: string[] = [];
  const observer = new MutationObserver(records => {
    for (const record of records) {
      const region = record.target as Element;
      if (region.getAttribute?.('data-astryx-live-region') !== 'polite') {
        continue;
      }
      for (const node of record.addedNodes) {
        const text = node.textContent?.trim() ?? '';
        if (text !== '') {
          spoken.push(text);
        }
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  return {spoken, stop: () => observer.disconnect()};
}

function mount() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return createRoot(container);
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('EmptyState announcement (spec:AST-086 FR2)', () => {
  it('announces nothing when it renders with the page', async () => {
    const {EmptyState, paint} = await importEmptyState();
    const polite = recordPolite();
    const root = mount();
    await act(async () => {
      root.render(<EmptyState title="No projects" description="Create one." />);
    });
    paint();
    await act(nextFrame);
    await act(nextFrame);
    polite.stop();
    expect(polite.spoken).toEqual([]);
    expect(document.querySelector('.astryx-empty-state')).not.toHaveAttribute(
      'role',
    );
    await act(async () => root.unmount());
  });

  it('announces its message once when it appears later', async () => {
    const {EmptyState, paint} = await importEmptyState();
    paint();
    let showEmpty!: () => void;
    function Results() {
      const [isEmpty, setIsEmpty] = useState(false);
      showEmpty = () => setIsEmpty(true);
      return isEmpty ? (
        <EmptyState
          icon={<span>icon</span>}
          title="No results"
          description="Try another search."
          actions={<button type="button">Clear filters</button>}
        />
      ) : (
        <p>Searching</p>
      );
    }
    const polite = recordPolite();
    const root = mount();
    await act(async () => {
      root.render(
        <StrictMode>
          <Results />
        </StrictMode>,
      );
    });
    await act(async () => showEmpty());
    await act(nextFrame);
    await act(nextFrame);
    polite.stop();
    expect(polite.spoken).toEqual(['No results Try another search.']);
    expect(
      document.querySelector('[role="status"].astryx-empty-state'),
    ).toBeNull();
    await act(async () => root.unmount());
  });

  it('leaves an empty state inside a live container to that container (spec:AST-086 FR4)', async () => {
    const {EmptyState, paint} = await importEmptyState();
    paint();
    let showEmpty!: () => void;
    function Log() {
      const [isEmpty, setIsEmpty] = useState(false);
      showEmpty = () => setIsEmpty(true);
      return (
        <div role="log" aria-live="polite">
          {isEmpty ? <EmptyState title="No messages yet" /> : null}
        </div>
      );
    }
    const polite = recordPolite();
    const root = mount();
    await act(async () => root.render(<Log />));
    await act(async () => showEmpty());
    await act(nextFrame);
    await act(nextFrame);
    polite.stop();
    expect(polite.spoken).toEqual([]);
    await act(async () => root.unmount());
  });

  it('announces once when the message of one present at load changes later', async () => {
    const {EmptyState, paint} = await importEmptyState();
    let setTitle!: (title: string) => void;
    function Search() {
      const [title, set] = useState('No saved searches');
      setTitle = set;
      return <EmptyState title={title} />;
    }
    const polite = recordPolite();
    const root = mount();
    await act(async () => root.render(<Search />));
    paint();
    await act(async () => setTitle('No results'));
    await act(nextFrame);
    await act(nextFrame);
    polite.stop();
    expect(polite.spoken).toEqual(['No results']);
    await act(async () => root.unmount());
  });
});
