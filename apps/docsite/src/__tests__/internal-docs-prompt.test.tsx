// Copyright (c) Meta Platforms, Inc. and affiliates.

// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://astryx.atmeta.com/components/Button?tab=props"}

import {StrictMode} from 'react';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  InternalDocsPrompt,
  internalDocsHref,
} from '../components/InternalDocsPrompt';

const route = vi.hoisted(() => ({
  pathname: '/components/Button',
  search: 'tab=props',
}));
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.search),
}));
vi.mock('@stylexjs/stylex', () => ({
  create: <T,>(styles: T) => styles,
  props: () => ({}),
}));

const allowedOrigins = [
  'https://astryx.atmeta.com',
  'https://astryx-git-feat-docs-internal-network-prompt-fbopensource.vercel.app',
  'https://astryx-canary.vercel.app',
];
declare const jsdom: {reconfigure(options: {url: string}): void};

let Prompt: typeof InternalDocsPrompt;
let href: typeof internalDocsHref;
const internalOrigin = 'https://astryx.internalmeta.com';
const message = {type: 'astryx:access-check:v1', reachable: true};

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  jsdom.reconfigure({
    url: 'https://astryx.atmeta.com/components/Button?tab=props',
  });
  route.pathname = '/components/Button';
  route.search = 'tab=props';
  const module = await import('../components/InternalDocsPrompt');
  Prompt = module.InternalDocsPrompt;
  href = module.internalDocsHref;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function mount() {
  const view = render(
    <StrictMode>
      <Prompt />
    </StrictMode>,
  );
  await act(async () => {});
  return view;
}

function frame() {
  const result = document.querySelector('iframe');
  expect(result).not.toBeNull();
  return result!;
}

function send(
  target: HTMLIFrameElement,
  data: unknown = message,
  origin = internalOrigin,
  source: MessageEventSource | null = target.contentWindow,
) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', {data, origin, source}));
  });
}

function showPrompt() {
  const target = frame();
  fireEvent.load(target);
  send(target);
}

function prompt() {
  return screen.queryByRole('complementary', {
    name: 'Internal Astryx documentation',
  });
}

describe('InternalDocsPrompt', () => {
  it('mounts once in a leaf Suspense boundary without converting the server layout', () => {
    const layout = readFileSync(join(__dirname, '../app/layout.tsx'), 'utf8');
    expect(layout).not.toContain("'use client'");
    expect(layout.match(/<InternalDocsPrompt\s*\/>/g)).toHaveLength(1);
    expect(layout).toMatch(
      /<Suspense fallback=\{null\}>\s*<InternalDocsPrompt \/>\s*<\/Suspense>\s*\{children\}/,
    );
  });

  it('renders nothing before a loaded iframe sends a valid message', async () => {
    await mount();
    expect(prompt()).toBeNull();
    const target = frame();
    expect(target.hidden).toBe(true);
    expect(target.tabIndex).toBe(-1);
    expect(target.getAttribute('aria-hidden')).toBe('true');
    expect(target.referrerPolicy).toBe('no-referrer');
    expect(target.src).toBe(
      `${internalOrigin}/embed/access-check?parent_origin=https%3A%2F%2Fastryx.atmeta.com`,
    );
    fireEvent.load(target);
    expect(prompt()).toBeNull();
    send(target);
    expect(prompt()).not.toBeNull();
    const link = screen.getByRole('link', {
      name: /Internal docs — open Astryx documentation/,
    });
    expect(link.textContent).toBe('Internal docs');
    expect(prompt()?.textContent).not.toContain("On Meta's network?");
    expect(prompt()?.textContent).not.toContain('Meta-specific components');
    expect(prompt()?.querySelectorAll('a')).toHaveLength(1);
    expect(prompt()?.querySelectorAll('button')).toHaveLength(1);
    expect(link.getAttribute('aria-label')).toContain('Meta network detected');
    expect(link.getAttribute('href')).toBe(
      `${internalOrigin}/components/Button?tab=props`,
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it.each(allowedOrigins)(
    'sends the actual allowlisted parent origin: %s',
    async origin => {
      const {ALLOWED_PARENT_ORIGINS} =
        await import('../lib/useInternalDocsPrompt');
      expect(ALLOWED_PARENT_ORIGINS).toEqual(allowedOrigins);
      jsdom.reconfigure({url: `${origin}/docs/tokens?mode=dark`});
      await mount();
      const target = frame();
      expect(new URL(target.src).searchParams.get('parent_origin')).toBe(
        origin,
      );
      fireEvent.load(target);
      send(target);
      expect(prompt()).not.toBeNull();
    },
  );

  it.each([
    'https://astryx-canary.vercel.app.evil.example',
    'https://astryx-git-feat-docs-internal-network-prompt-fbopensource.vercel.app.evil.example',
    'http://astryx-canary.vercel.app',
    'https://astryx-f3fuc1mqg-fbopensource.vercel.app',
    'https://astryx-git-unapproved-fbopensource.vercel.app',
    'https://astryx-canary-otherteam.vercel.app',
    'http://localhost:3233',
  ])('does not probe on an unallowlisted parent: %s', async origin => {
    jsdom.reconfigure({url: `${origin}/docs/tokens`});
    await mount();
    expect(document.querySelector('iframe')).toBeNull();
    expect(prompt()).toBeNull();
  });

  it('also accepts the message before the iframe load event', async () => {
    await mount();
    const target = frame();
    send(target);
    expect(prompt()).toBeNull();
    fireEvent.load(target);
    expect(prompt()).not.toBeNull();
  });

  it.each([
    'https://evil.example',
    'https://astryx.internalmeta.com.evil.example',
    'http://astryx.internalmeta.com',
    'null',
  ])('ignores messages from the wrong origin: %s', async origin => {
    await mount();
    const target = frame();
    fireEvent.load(target);
    send(target, message, origin);
    expect(prompt()).toBeNull();
    send(target);
    expect(prompt()).not.toBeNull();
  });

  it.each([
    null,
    {},
    {type: 'wrong', reachable: true},
    {type: message.type, reachable: false},
    {type: message.type, reachable: 'true'},
    {type: message.type, reachable: 1},
  ])('ignores wrong types or non-boolean reachability: %j', async data => {
    await mount();
    const target = frame();
    fireEvent.load(target);
    send(target, data);
    expect(prompt()).toBeNull();
  });

  it('ignores the right payload from another window', async () => {
    await mount();
    const target = frame();
    fireEvent.load(target);
    send(target, message, internalOrigin, window);
    expect(prompt()).toBeNull();
  });

  it('times out silently and cleans up the iframe and listener', async () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    await mount();
    const target = frame();
    fireEvent.load(target);
    act(() => vi.advanceTimersByTime(4000));
    expect(prompt()).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(removeListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
    send(target);
    expect(prompt()).toBeNull();
  });

  it('runs at most once under StrictMode and after remounting', async () => {
    const append = vi.spyOn(document.body, 'append');
    const view = await mount();
    expect(append).toHaveBeenCalledTimes(1);
    showPrompt();
    view.unmount();
    await mount();
    expect(append).toHaveBeenCalledTimes(1);
    expect(prompt()).not.toBeNull();
  });

  it('cancels on unmount and does not restart an abandoned probe', async () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const view = await mount();
    view.unmount();
    expect(document.querySelector('iframe')).toBeNull();
    expect(removeListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
    await mount();
    expect(document.querySelector('iframe')).toBeNull();
    expect(prompt()).toBeNull();
  });

  it('dismisses only the mounted view without writing storage or cookies', async () => {
    for (const path of [
      'components/InternalDocsPrompt.tsx',
      'lib/useInternalDocsPrompt.ts',
    ]) {
      const source = readFileSync(join(__dirname, '..', path), 'utf8');
      expect(source).not.toMatch(
        /sessionStorage|localStorage|document\.cookie/,
      );
    }
    const view = await mount();
    showPrompt();
    const before = {
      session: {...window.sessionStorage},
      local: {...window.localStorage},
      cookie: document.cookie,
    };
    const close = screen.getByRole('button', {
      name: 'Dismiss internal docs prompt',
    });
    expect(close.getAttribute('tabindex')).not.toBe('-1');
    fireEvent.click(close);
    expect(prompt()).toBeNull();
    view.rerender(
      <StrictMode>
        <Prompt />
      </StrictMode>,
    );
    expect(prompt()).toBeNull();
    expect({
      session: {...window.sessionStorage},
      local: {...window.localStorage},
      cookie: document.cookie,
    }).toEqual(before);
    view.unmount();
    await mount();
    expect(prompt()).not.toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('resets dismissal on pathname and query navigation, including returning to a dismissed URL', async () => {
    const view = await mount();
    showPrompt();
    for (const [pathname, search] of [
      ['/docs/tokens', ''],
      ['/docs/tokens', 'mode=dark'],
      ['/components/Button', 'tab=props'],
    ]) {
      fireEvent.click(
        screen.getByRole('button', {name: 'Dismiss internal docs prompt'}),
      );
      expect(prompt()).toBeNull();
      route.pathname = pathname;
      route.search = search;
      view.rerender(
        <StrictMode>
          <Prompt />
        </StrictMode>,
      );
      expect(prompt()).not.toBeNull();
      expect(document.querySelector('iframe')).toBeNull();
    }
  });

  it('keeps an in-flight probe alive across client navigation', async () => {
    const view = await mount();
    const target = frame();
    route.pathname = '/docs/tokens';
    view.rerender(
      <StrictMode>
        <Prompt />
      </StrictMode>,
    );
    expect(frame()).toBe(target);
    fireEvent.load(target);
    send(target);
    expect(prompt()).not.toBeNull();
  });

  it('updates the link on client navigation without probing again', async () => {
    const view = await mount();
    showPrompt();
    route.pathname = '/docs/tokens';
    route.search = 'mode=dark&query=a%26b';
    view.rerender(
      <StrictMode>
        <Prompt />
      </StrictMode>,
    );
    expect(
      screen
        .getByRole('link', {name: /Internal docs — open Astryx documentation/})
        .getAttribute('href'),
    ).toBe(`${internalOrigin}/docs/tokens?mode=dark&query=a%26b`);
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('internalDocsHref', () => {
  it.each([
    '/',
    '/docs',
    '/docs/tokens',
    '/components/Button',
    '/templates/example',
    '/themes',
    '/playground',
  ])('preserves shared route %s and its query', pathname => {
    expect(href(pathname, 'a=1&a=2')).toBe(
      `${internalOrigin}${pathname}?a=1&a=2`,
    );
  });
  it.each([
    '/blog',
    '/blog/launch',
    '/community',
    '/changelog',
    '/playground/preview',
    '//evil.example',
    '/docs/a/b',
  ])(
    'falls back to the home page for public-only or unknown route %s',
    pathname => {
      expect(href(pathname, 'a=1')).toBe(`${internalOrigin}/`);
    },
  );
});
