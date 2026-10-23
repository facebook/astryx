// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EmptyState.announce.test.tsx
 * @input A fresh EmptyState module with the page's first paint held back
 * @output spec:AST-086 FR11/FR12 tests for EmptyState's announcement
 * @position Component test for EmptyState's announcement
 */

import {act, StrictMode, useState} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';

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

/** Every write to the shared polite region, one entry per write. */
function recordPolite() {
  const spoken: string[] = [];
  const observer = new MutationObserver(records => {
    for (const {target, addedNodes} of records) {
      const isPolite =
        (target as Element).getAttribute?.('data-astryx-live-region') ===
        'polite';
      for (const node of isPolite ? addedNodes : []) {
        if (node.textContent?.trim()) {spoken.push(node.textContent.trim());}
      }
    }
  });
  observer.observe(document.body, {subtree: true, childList: true});
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

  it('announces nothing from a server render or its hydration (FR12)', async () => {
    const {EmptyState, paint} = await importEmptyState();
    const tree = <EmptyState title="No projects" />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);
    expect(container.querySelector('[role], [aria-live]')).toBeNull();
    paint();
    const polite = recordPolite();
    const root = await act(async () => hydrateRoot(container, tree));
    await act(nextFrame);
    await act(nextFrame);
    polite.stop();
    expect(polite.spoken).toEqual([]);
    await act(async () => root.unmount());
  });
});
