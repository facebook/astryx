// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavShell.test.tsx
 * @input Uses react-dom/server, react-dom/static, the server shells
 *   (TopNavShell.tsx, TopNavItemShell.tsx, Button/ButtonShell.tsx) and the
 *   client TopNav, TopNavItem and Button
 * @output Markup-parity tests: a server-rendered TopNav renders exactly what
 *   the client TopNav renders: the desktop bar, AppShell's mobile bar and
 *   drawer, a LinkProvider and a localized landmark label
 * @position Testing; validates TopNavShell.tsx, TopNavFrame.tsx,
 *   TopNavItemShell.tsx and TopNavItemGate.tsx. serverRender.test.ts proves
 *   the shells run under the react-server React build.
 *
 * SYNC: When the TopNav shells or their client parts change, update the
 * matrix here.
 */

import {describe, it, expect} from 'vitest';
import type {ReactElement, ReactNode} from 'react';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {prerender} from 'react-dom/static';
import {TopNav as ClientTopNav, type TopNavProps} from './TopNav';
import {TopNav as ServerTopNav, needsClientTopNav} from './TopNavShell';
import {
  TopNavItem as ClientTopNavItem,
  type TopNavItemProps,
} from './TopNavItem';
import {
  TopNavItem as ServerTopNavItem,
  needsClientTopNavItem,
} from './TopNavItemShell';
import {TopNavHeading} from './TopNavHeading';
import {TopNavMenu} from './TopNavMenu';
import {
  TopNavRenderContext,
  type TopNavRenderMode,
} from './TopNavRenderContext';
import {Button as ClientButton, type ButtonProps} from '../Button/Button';
import {Button as ServerButton} from '../Button/ButtonShell';
import {LinkProvider} from '../Link/LinkProvider';
import {InternationalizationProvider} from '../i18n/InternationalizationProvider';
import {
  AppShellMobileContext,
  type AppShellMobileContextValue,
} from '../AppShell/AppShellMobileContext';

// Module scope: the provider memoizes on prop identity.
const FR_MESSAGES = {
  fr: {'@astryx.topNav.landmarkLabel': 'Navigation supérieure'},
};

/** Static markup once lazy client parts have loaded, Suspense comments removed. */
async function markup(element: ReactElement): Promise<string> {
  await new Response((await prerender(element)).prelude).text();
  const html = await new Response((await prerender(element)).prelude).text();
  return html.replace(/<!--\/?\$[!?]?-->/g, '');
}

/**
 * The DOM a client render settles on, once lazy client parts have loaded.
 * AppShell's mobile modes only exist on the client, and the drawer's content
 * is large enough that a static render outlines it behind a script, so these
 * compare the mounted DOM. useId values come from a counter shared by every
 * root, so each id is renumbered in order of appearance.
 */
async function mounted(element: ReactElement): Promise<string> {
  const container = document.createElement('div');
  const root = createRoot(container);
  for (let pass = 0; pass < 3; pass++) {
    await act(async () => {
      root.render(element);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  }
  const html = container.innerHTML;
  act(() => root.unmount());
  const ids = new Map<string, string>();
  return html.replace(/_r_[0-9a-z]+_/g, id => {
    if (!ids.has(id)) {
      ids.set(id, `id${ids.size}`);
    }
    return ids.get(id)!;
  });
}

type Parts = {
  Nav: (props: TopNavProps) => ReactNode;
  Item: (props: TopNavItemProps) => ReactNode;
  Button: (props: ButtonProps) => ReactNode;
};
const SERVER: Parts = {
  Nav: ServerTopNav,
  Item: ServerTopNavItem,
  Button: ServerButton,
};
const CLIENT: Parts = {
  Nav: ClientTopNav,
  Item: ClientTopNavItem,
  Button: ClientButton,
};

/** A header as a Server Component would write it, built from either set. */
const HEADERS: [string, (parts: Parts) => ReactElement][] = [
  [
    'heading only',
    ({Nav}) => <Nav heading={<TopNavHeading heading="Stats" />} />,
  ],
  [
    'items and an end button',
    ({Nav, Item, Button}) => (
      <Nav
        heading={<TopNavHeading heading="Stats" />}
        startContent={
          <>
            <Item label="Home" href="/" isSelected />
            <Item label="Packages" href="/packages" />
            <Item label="Off" href="/off" isDisabled />
          </>
        }
        endContent={<Button label="Docs" variant="ghost" href="/docs" />}
      />
    ),
  ],
  [
    'children as start content, a custom label and caller props',
    ({Nav, Item}) => (
      <Nav label="Main" className="mine" data-testid="nav">
        <Item label="Home" href="/" />
      </Nav>
    ),
  ],
  [
    'center content (grid layout)',
    ({Nav, Item, Button}) => (
      <Nav
        heading={<TopNavHeading heading="Stats" />}
        centerContent={
          <>
            <Item label="Overview" href="/" isSelected />
            <Item label="Trends" href="/trends" />
          </>
        }
        endContent={<Button label="Sign in" variant="primary" />}
      />
    ),
  ],
  [
    'a menu in a slot',
    ({Nav, Item}) => (
      <Nav
        startContent={
          <>
            <Item label="Home" href="/" />
            <TopNavMenu
              label="More"
              items={[{title: 'About', href: '/about'}]}
            />
          </>
        }
      />
    ),
  ],
];

describe('TopNav server shell', () => {
  it.each(HEADERS)('renders the desktop bar: %s', async (_name, header) => {
    expect(await markup(header(SERVER))).toBe(await markup(header(CLIENT)));
  });

  // AppShell renders its `topNav` in these modes; the server shell hands each
  // to the client TopNav, and each item to the client TopNavItem.
  it.each([['mobile-bar'], ['drawer']] as [TopNavRenderMode][])(
    "renders like the client TopNav in AppShell's %s",
    async mode => {
      for (const [name, header] of HEADERS) {
        const inMode = (parts: Parts) => (
          <TopNavRenderContext value={mode}>
            {header(parts)}
          </TopNavRenderContext>
        );
        expect(await mounted(inMode(SERVER)), name).toBe(
          await mounted(inMode(CLIENT)),
        );
      }
    },
  );

  it("shows AppShell's mobile bar on its first commit, before any chunk loads", async () => {
    // A phone hydrates the desktop bar, then AppShell switches to the mobile
    // bar. That switch must not wait on the client TopNav: the first commit
    // already hides the items. (The toggle is MobileNavToggle, which AppShell
    // loads itself.)
    const mobile: AppShellMobileContextValue = {
      isMobile: true,
      isMobileNavOpen: false,
      toggleMobileNav: () => {},
      openMobileNav: () => {},
      closeMobileNav: () => {},
      isMobileNavEnabled: true,
      hasAutoToggle: true,
    };
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() =>
      root.render(
        <AppShellMobileContext value={mobile}>
          <TopNavRenderContext value="mobile-bar">
            {HEADERS[1][1](SERVER)}
          </TopNavRenderContext>
        </AppShellMobileContext>,
      ),
    );
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('data-mode')).toBe('mobile-bar');
    expect(container.textContent).toContain('Stats');
    expect(container.textContent).not.toContain('Packages');
    act(() => root.unmount());
  });

  it('shows no horizontal item in the drawer before the client item loads', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() =>
      root.render(
        <TopNavRenderContext value="drawer">
          <ServerTopNavItem label="Fresh" href="/fresh" />
        </TopNavRenderContext>,
      ),
    );
    // Either nothing yet, or the drawer item: never the bar's item, which
    // would navigate without closing the drawer.
    const link = container.querySelector('a');
    expect(link === null || link.getAttribute('data-mode') === 'drawer').toBe(
      true,
    );
    act(() => root.unmount());
  });

  it('localizes the default landmark label', async () => {
    const localized = (parts: Parts) => (
      <InternationalizationProvider locale="fr" messages={FR_MESSAGES}>
        {HEADERS[1][1](parts)}
      </InternationalizationProvider>
    );
    const server = await markup(localized(SERVER));
    expect(server).toBe(await markup(localized(CLIENT)));
    expect(server).toContain('aria-label="Navigation supérieure"');
  });

  it('renders the client TopNav for a ref or a function prop', () => {
    const cases: TopNavProps[] = [{ref: {current: null}}, {onClick: () => {}}];
    for (const props of cases) {
      expect(needsClientTopNav(props)).toBe(true);
      expect(renderToStaticMarkup(<ServerTopNav {...props} />)).toBe(
        renderToStaticMarkup(<ClientTopNav {...props} />),
      );
    }
    expect(needsClientTopNav({heading: 'x', label: 'y'})).toBe(false);
  });
});

describe('TopNavItem server shell', () => {
  const PRESENTATIONAL: [string, TopNavItemProps][] = [
    ['plain', {label: 'Home', href: '/'}],
    ['selected', {label: 'Home', href: '/', isSelected: true}],
    [
      'disabled',
      {label: 'Home', href: '/', target: '_blank', isDisabled: true},
    ],
    [
      'icon-only',
      {label: 'Settings', href: '/s', icon: <svg />, isIconOnly: true},
    ],
    ['children', {label: 'Home', href: '/', children: 'Start'}],
    ['native anchor as', {label: 'Home', href: '/', as: 'a'}],
    ['rejected destination', {label: 'Bad', href: 'javascript:alert(1)'}],
    ['no destination', {label: 'Nowhere'}],
    [
      'link attributes',
      {
        label: 'Ext',
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener',
        download: true,
      },
    ],
  ];

  it.each(PRESENTATIONAL)('renders %s on the server', (_name, props) => {
    expect(needsClientTopNavItem(props)).toBe(false);
    expect(renderToStaticMarkup(<ServerTopNavItem {...props} />)).toBe(
      renderToStaticMarkup(<ClientTopNavItem {...props} />),
    );
  });

  it.each([
    ['onClick', {label: 'Home', onClick: () => {}}],
    ['ref', {label: 'Home', ref: {current: null}}],
    ['component as', {label: 'Home', href: '/', as: () => null}],
  ] as [string, TopNavItemProps][])(
    'renders the client item for %s',
    (_name, props) => {
      expect(needsClientTopNavItem(props)).toBe(true);
    },
  );

  it('renders like the client item under a LinkProvider and in the drawer', async () => {
    const Router = ({to: _to, ...rest}: {to?: unknown}) => (
      <a data-router="" {...rest} />
    );
    const wraps: ((node: ReactNode) => ReactNode)[] = [
      node => <LinkProvider component={Router}>{node}</LinkProvider>,
      node => <TopNavRenderContext value="drawer">{node}</TopNavRenderContext>,
    ];
    for (const wrap of wraps) {
      for (const [, props] of PRESENTATIONAL) {
        expect(await markup(<>{wrap(<ServerTopNavItem {...props} />)}</>)).toBe(
          await markup(<>{wrap(<ClientTopNavItem {...props} />)}</>),
        );
      }
    }
  });
});
