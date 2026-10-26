// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchSupport.test.tsx
 * @input TouchSupport, useTouchSupport, and React's client and server renderers
 * @output INV13's install checks: two installs register once; an install in a
 *   server render leaves the HTML unchanged; a page without it keeps the plain
 *   behavior; isInstalled() before and after; the object exposes nothing else;
 *   an install adds no listeners
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
  const {subscribeTouchModule} = await import('./touchSupportRegistry');
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
    touchModule,
    Probe,
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

  it('adds no listeners when it installs', async () => {
    const {TouchSupport} = await freshPage();
    const onWindow = vi.spyOn(window, 'addEventListener');
    const onDocument = vi.spyOn(document, 'addEventListener');
    TouchSupport.install();
    expect(onWindow).not.toHaveBeenCalled();
    expect(onDocument).not.toHaveBeenCalled();
  });
});
