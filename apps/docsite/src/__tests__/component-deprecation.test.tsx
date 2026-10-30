// Copyright (c) Meta Platforms, Inc. and affiliates.

// @vitest-environment jsdom

/**
 * @file A deprecated component's page labels it by the title and leads with a
 * notice naming the replacement and linking to its page; a current
 * component's page shows neither. Both read the registry entry's
 * `deprecated`, generated from the component doc.
 */

import {cleanup, render, screen, within} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {components} from '../generated/componentRegistry';
import {
  DEPRECATED_LABEL,
  DeprecatedBadge,
  DeprecationNotice,
} from '../components/Deprecation';
import {ComponentDetailClient} from '../components/component-detail/ComponentDetailClient';
import {DocsShell} from '../components/DocsShell';
import ComponentsGalleryPage from '../app/(docs)/components/page';

const route = vi.hoisted(() => ({pathname: '/components/Example'}));
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({replace: () => {}, push: () => {}}),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@stylexjs/stylex', () => ({
  create: <T,>(styles: T) => styles,
  props: () => ({}),
  defineVars: <T,>(vars: T) => vars,
  defineConsts: <T,>(consts: T) => consts,
}));
// The page's previews and tabs are not under test; keep the article light.
vi.mock('../components/component-detail/ShowcasePreview', () => ({
  ShowcasePreview: () => null,
}));
vi.mock('../components/component-detail/PlaygroundPropsTable', () => ({
  PlaygroundPropsTable: () => null,
}));
vi.mock('../components/ShowcaseThumbnail', () => ({
  ShowcaseThumbnail: () => null,
}));
// The playground's theme objects need built theme packages, which the data
// job does not build; the presentation under test reads none of them.
vi.mock('../generated/themeRegistry', () => ({themeObjectsFull: {}}));

// jsdom has no matchMedia or ResizeObserver; the page's responsive hooks and
// the shell's header measurement only need them to exist.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});
afterEach(cleanup);

const all = Object.entries(components).flatMap(([pkg, entries]) =>
  entries.map(entry => ({pkg, entry})),
);

describe('deprecation presentation', () => {
  const deprecation = {
    replacement: 'NewThing',
    replacementDisplayName: 'New Thing',
    description: 'Render a NewThing with steps instead.',
  };

  it('the notice states the status, names the replacement, and links to it', () => {
    render(<DeprecationNotice deprecation={deprecation} />);
    expect(
      screen.getByText(`${DEPRECATED_LABEL}: use New Thing instead`),
    ).toBeTruthy();
    expect(screen.getByText(deprecation.description)).toBeTruthy();
    expect(
      screen.getByRole('link', {name: 'View New Thing'}).getAttribute('href'),
    ).toBe('/components/NewThing');
  });

  it('the badge reads Deprecated', () => {
    render(<DeprecatedBadge />);
    expect(screen.getByText(DEPRECATED_LABEL)).toBeTruthy();
  });

  it("a deprecated component's page shows the badge by its title and the notice before its content", () => {
    const found = all.find(({entry}) => entry.deprecated);
    expect(found).toBeDefined();
    const {pkg, entry} = found!;
    const {container} = render(
      <ComponentDetailClient
        comp={entry}
        pkg={pkg}
        pkgVersion="0.0.0"
        showcase={undefined}
      />,
    );
    const title = screen.getByText(entry.displayName, {
      selector: '.astryx-text, span, p, div',
    });
    const titleRow = title.parentElement!;
    expect(within(titleRow).getByText(DEPRECATED_LABEL)).toBeTruthy();
    const notice = screen.getByText(
      `${DEPRECATED_LABEL}: use ${entry.deprecated!.replacementDisplayName} instead`,
    );
    // The notice sits above the tabs and the overview.
    const tabs = container.querySelector('[role="tablist"]');
    if (tabs) {
      expect(
        notice.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(
      screen
        .getByRole('link', {
          name: `View ${entry.deprecated!.replacementDisplayName}`,
        })
        .getAttribute('href'),
    ).toBe(`/components/${entry.deprecated!.replacement}`);
  });

  it('the sidebar marks the deprecated entry, and only it', () => {
    const {entry} = all.find(({entry}) => entry.deprecated)!;
    route.pathname = `/components/${entry.name}`;
    const {container} = render(
      <DocsShell packages={[]} docTopics={[]}>
        <div />
      </DocsShell>,
    );
    const link = container.querySelector(
      `a.astryx-side-nav-item[href="/components/${entry.name}"]`,
    );
    expect(link).not.toBeNull();
    expect(
      within(link as HTMLElement).getByRole('img', {name: DEPRECATED_LABEL}),
    ).toBeTruthy();
    const deprecatedNames = new Set(
      all.filter(({entry}) => entry.deprecated).map(({entry}) => entry.name),
    );
    for (const item of container.querySelectorAll('a.astryx-side-nav-item')) {
      const name = item.getAttribute('href')?.replace('/components/', '');
      expect(
        within(item as HTMLElement).queryByRole('img', {
          name: DEPRECATED_LABEL,
        }) != null,
        name,
      ).toBe(deprecatedNames.has(name ?? ''));
    }
  });

  it('the components index labels the deprecated tile, and only it', () => {
    const {container} = render(<ComponentsGalleryPage />);
    const deprecatedNames = new Set(
      all.filter(({entry}) => entry.deprecated).map(({entry}) => entry.name),
    );
    const tiles = [
      ...container.querySelectorAll<HTMLAnchorElement>(
        'a[href^="/components/"]',
      ),
    ];
    expect(tiles.length).toBeGreaterThan(0);
    let labeled = 0;
    for (const tile of tiles) {
      const name = tile.getAttribute('href')!.replace('/components/', '');
      const row = tile.parentElement!.parentElement!;
      const hasBadge = within(row).queryByText(DEPRECATED_LABEL) != null;
      expect(hasBadge, name).toBe(deprecatedNames.has(name));
      if (hasBadge) {
        labeled++;
      }
    }
    expect(labeled).toBeGreaterThan(0);
  });

  it("a current component's page shows no deprecation", () => {
    const {pkg, entry} = all.find(
      ({entry}) => !entry.deprecated && entry.props.length > 0,
    )!;
    render(
      <ComponentDetailClient
        comp={entry}
        pkg={pkg}
        pkgVersion="0.0.0"
        showcase={undefined}
      />,
    );
    expect(screen.queryByText(DEPRECATED_LABEL)).toBeNull();
    expect(screen.queryByText(/^Deprecated: use /)).toBeNull();
  });
});
