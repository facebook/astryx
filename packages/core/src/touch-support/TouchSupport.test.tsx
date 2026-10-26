// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchSupport.test.tsx
 * @input TouchSupport, useTouchSupport, and React's client and server renderers
 * @output INV13's install checks: two installs register once; an install in a
 *   server render leaves the HTML unchanged; a page without it keeps the plain
 *   behavior; isInstalled() before and after; a fine-pointer page registers
 *   nothing and one that gains a coarse pointer later registers then; the
 *   object exposes nothing else; an install adds no window or document
 *   listeners
 * @position Unit and server-render tests of packages/core/src/touch-support
 *   (architecture:react-component-runtime INV13)
 */

import {act, render, screen} from '@testing-library/react';
import {hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';

/** A fresh page: the registry, the entry and the hook load anew. */
async function freshPage() {
  vi.resetModules();
  const {default: TouchSupport} = await import('./index');
  const {useTouchSupport} = await import('./useTouchSupport');
  const {subscribeTouchModule, resetTouchSupportForTests} =
    await import('./touchSupportRegistry');
  const {touchModule} = await import('./touchModule');
  /** A component's dependency check: touch behavior with the module only. */
  function Probe() {
    const touch = useTouchSupport();
    return (
      <span data-testid="probe">{touch === null ? 'plain' : 'touch'}</span>
    );
  }
  return {
    TouchSupport,
    useTouchSupport,
    subscribeTouchModule,
    resetTouchSupportForTests,
    touchModule,
    Probe,
  };
}

/**
 * The page's pointers as `(any-pointer: coarse)` reports them: a stubbed
 * `matchMedia` whose query can gain a coarse pointer later, like a tablet
 * attached to a laptop.
 */
function stubPointers({coarse}: {coarse: boolean}) {
  let matches = coarse;
  const listeners = new Set<() => void>();
  const query = {
    media: '(any-pointer: coarse)',
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((type: string, listener: () => void) => {
      if (type === 'change') {
        listeners.add(listener);
      }
    }),
    removeEventListener: vi.fn((type: string, listener: () => void) => {
      if (type === 'change') {
        listeners.delete(listener);
      }
    }),
  };
  const matchMedia = vi.fn((media: string) => {
    expect(media).toBe('(any-pointer: coarse)');
    return query;
  });
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    query,
    listeners,
    gainCoarsePointer() {
      matches = true;
      for (const listener of [...listeners]) {
        listener();
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe('TouchSupport', () => {
  it('leaves a page without it on the plain behavior', async () => {
    const {TouchSupport, Probe} = await freshPage();
    render(<Probe />);
    expect(screen.getByTestId('probe').textContent).toBe('plain');
    expect(TouchSupport.isInstalled()).toBe(false);
  });

  it('reports isInstalled() before and after install(), and components render once more with the module', async () => {
    stubPointers({coarse: true});
    const {TouchSupport, useTouchSupport, touchModule, Probe} =
      await freshPage();
    const seen: unknown[] = [];
    function Recorder() {
      seen.push(useTouchSupport());
      return null;
    }
    render(
      <>
        <Probe />
        <Recorder />
      </>,
    );
    expect(TouchSupport.isInstalled()).toBe(false);
    expect(seen).toEqual([null]);

    act(() => {
      TouchSupport.install();
    });

    expect(TouchSupport.isInstalled()).toBe(true);
    expect(screen.getByTestId('probe').textContent).toBe('touch');
    expect(seen).toEqual([null, touchModule]);
  });

  it('registers once when install() is called twice', async () => {
    stubPointers({coarse: true});
    const {TouchSupport, subscribeTouchModule} = await freshPage();
    const listener = vi.fn();
    subscribeTouchModule(listener);

    TouchSupport.install();
    TouchSupport.install();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(TouchSupport.isInstalled()).toBe(true);
  });

  it('does nothing when install() runs on the server', async () => {
    const {TouchSupport} = await freshPage();
    vi.stubGlobal('window', undefined);
    TouchSupport.install();
    vi.unstubAllGlobals();
    expect(TouchSupport.isInstalled()).toBe(false);
  });

  it('leaves server HTML unchanged, and the page hydrates without a mismatch', async () => {
    stubPointers({coarse: true});
    const {TouchSupport, Probe} = await freshPage();
    const before = renderToString(<Probe />);
    TouchSupport.install();
    const after = renderToString(<Probe />);
    expect(after).toBe(before);
    expect(after).toContain('plain');

    // The hydrating render reads the server answer, then renders once more
    // with the installed module.
    const container = document.createElement('div');
    container.innerHTML = after;
    document.body.appendChild(container);
    const recoverableErrors: unknown[] = [];
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <Probe />, {
        onRecoverableError: error => recoverableErrors.push(error),
      });
    });
    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toBe('touch');
    await act(async () => {
      root.unmount();
    });
  });

  it('exposes only install() and isInstalled()', async () => {
    const {TouchSupport} = await freshPage();
    expect(Object.keys(TouchSupport).sort()).toEqual([
      'install',
      'isInstalled',
    ]);
    expect(Object.isFrozen(TouchSupport)).toBe(true);
  });

  it('adds no listeners when it installs where a coarse pointer is present', async () => {
    const {query} = stubPointers({coarse: true});
    const {TouchSupport} = await freshPage();
    const onWindow = vi.spyOn(window, 'addEventListener');
    const onDocument = vi.spyOn(document, 'addEventListener');
    TouchSupport.install();
    expect(onWindow).not.toHaveBeenCalled();
    expect(onDocument).not.toHaveBeenCalled();
    expect(query.addEventListener).not.toHaveBeenCalled();
  });

  it('registers nothing on a fine-pointer-only page, and waits with one change listener', async () => {
    const {query, listeners} = stubPointers({coarse: false});
    const {TouchSupport, subscribeTouchModule, Probe} = await freshPage();
    render(<Probe />);
    const registered = vi.fn();
    subscribeTouchModule(registered);
    const onWindow = vi.spyOn(window, 'addEventListener');
    const onDocument = vi.spyOn(document, 'addEventListener');
    act(() => {
      TouchSupport.install();
      TouchSupport.install();
    });
    expect(registered).not.toHaveBeenCalled();
    expect(screen.getByTestId('probe').textContent).toBe('plain');
    expect(TouchSupport.isInstalled()).toBe(true);
    expect(onWindow).not.toHaveBeenCalled();
    expect(onDocument).not.toHaveBeenCalled();
    expect(query.addEventListener).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(1);
  });

  it('registers when a coarse pointer appears later, then stops listening', async () => {
    const {listeners, gainCoarsePointer} = stubPointers({coarse: false});
    const {TouchSupport, Probe} = await freshPage();
    render(<Probe />);
    TouchSupport.install();
    expect(screen.getByTestId('probe').textContent).toBe('plain');
    act(() => {
      gainCoarsePointer();
    });
    expect(screen.getByTestId('probe').textContent).toBe('touch');
    expect(listeners.size).toBe(0);
  });

  it('forgets the install on resetTouchSupportForTests(), as on a fresh page', async () => {
    stubPointers({coarse: true});
    const {TouchSupport, resetTouchSupportForTests, Probe} = await freshPage();
    render(<Probe />);
    act(() => {
      TouchSupport.install();
    });
    expect(screen.getByTestId('probe').textContent).toBe('touch');
    act(() => {
      resetTouchSupportForTests();
    });
    expect(TouchSupport.isInstalled()).toBe(false);
    expect(screen.getByTestId('probe').textContent).toBe('plain');
    act(() => {
      TouchSupport.install();
    });
    expect(screen.getByTestId('probe').textContent).toBe('touch');
  });

  it('forgets a fine-pointer install on resetTouchSupportForTests(), so a later coarse pointer registers nothing', async () => {
    const {listeners, gainCoarsePointer} = stubPointers({coarse: false});
    const {
      TouchSupport,
      subscribeTouchModule,
      resetTouchSupportForTests,
      Probe,
    } = await freshPage();
    render(<Probe />);
    TouchSupport.install();
    expect(listeners.size).toBe(1);
    act(() => {
      resetTouchSupportForTests();
    });
    expect(listeners.size).toBe(0);
    const registered = vi.fn();
    subscribeTouchModule(registered);
    act(() => {
      gainCoarsePointer();
    });
    expect(registered).not.toHaveBeenCalled();
    expect(TouchSupport.isInstalled()).toBe(false);
    expect(screen.getByTestId('probe').textContent).toBe('plain');
  });
});
