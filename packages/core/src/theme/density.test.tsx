// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import React from 'react';
import {Theme} from './Theme';
import {defineTheme} from './defineTheme';
import {
  compactLeadingPx,
  compactTextPx,
  resolveDensityTokens,
  useThemeDensity,
  DENSITY_TOKEN_NAMES,
} from './density';
import {useSize} from '../SizeContext/SizeContext';
import {useTheme} from './useTheme';
import {Table} from '../Table';
import {Selector} from '../Selector';
import {SideNavItem} from '../SideNav/SideNavItem';
import {SizeProvider} from '../SizeContext/SizeContext';
import {SideNavHeading} from '../SideNav/SideNavHeading';
import {TopNavHeading} from '../TopNav/TopNavHeading';
import {TopNavItem} from '../TopNav/TopNavItem';
import {TopNavRenderContext} from '../TopNav/TopNavRenderContext';
import {declaredValue} from '../__tests__/stylexDeclarations';

const plain = defineTheme({name: 'density-plain'});
const roomy = defineTheme({
  name: 'density-roomy',
  typography: {scale: {base: 16, ratio: 1.25}},
  tokens: {'--spacing-4': '20px', '--text-supporting-size': '12px'},
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-astryx-theme');
});

function Probe() {
  const size = useSize();
  const density = useThemeDensity();
  return <span data-testid="probe" data-size={size} data-density={density} />;
}

function rootOf(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-astryx-theme]') as HTMLElement;
}

describe('compact scale rules', () => {
  it('steps text down about one step and floors at 11px', () => {
    expect(compactTextPx(14)).toBe(13);
    expect(compactTextPx(12)).toBe(11);
    expect(compactTextPx(24)).toBe(22);
    expect(compactTextPx(42)).toBe(39);
    // Already at or below the floor: unchanged.
    expect(compactTextPx(11)).toBe(11);
    expect(compactTextPx(10)).toBe(10);
  });

  it('computes tight, even-px line heights', () => {
    expect(compactLeadingPx(13)).toBe(18);
    expect(compactLeadingPx(11)).toBe(16);
    expect(compactLeadingPx(22)).toBe(28);
  });
});

describe('resolveDensityTokens', () => {
  it('tightens spacing 3–12 by 0.75 and keeps 0–2 intact', () => {
    const tokens = resolveDensityTokens(plain, 'compact');
    expect(tokens['--spacing-3']).toBe('9px');
    expect(tokens['--spacing-4']).toBe('12px');
    expect(tokens['--spacing-6']).toBe('18px');
    expect(tokens['--spacing-12']).toBe('36px');
    expect(tokens).not.toHaveProperty('--spacing-0');
    expect(tokens).not.toHaveProperty('--spacing-1');
    expect(tokens).not.toHaveProperty('--spacing-2');
  });

  it('steps the default type ramp down', () => {
    const tokens = resolveDensityTokens(plain, 'compact');
    expect(tokens['--text-body-size']).toBe('0.8125rem'); // 13px
    expect(tokens['--text-body-leading']).toBe('1.3846'); // 18px
    expect(tokens['--text-label-size']).toBe('0.8125rem'); // 13px
    expect(tokens['--text-supporting-size']).toBe('0.6875rem'); // 11px
    expect(tokens['--text-heading-1-size']).toBe('1.375rem'); // 22px
    expect(tokens['--text-display-1-size']).toBe('2.4375rem'); // 39px
    expect(tokens['--font-size-base']).toBe('0.8125rem');
    expect(tokens['--font-size-sm']).toBe('0.6875rem');
  });

  it('derives from the theme’s own scale and token overrides', () => {
    const tokens = resolveDensityTokens(roomy, 'compact');
    expect(tokens['--spacing-4']).toBe('15px'); // theme 20px × 0.75
    expect(tokens['--text-body-size']).toBe('0.9375rem'); // theme 16px → 15px
    expect(tokens['--text-supporting-size']).toBe('0.6875rem'); // theme 12px → 11px
  });

  it('scales non-length spacing with calc()', () => {
    const fluid = defineTheme({
      name: 'density-fluid',
      tokens: {'--spacing-8': 'clamp(24px, 3vw, 40px)'},
    });
    expect(resolveDensityTokens(fluid, 'compact')['--spacing-8']).toBe(
      'calc(clamp(24px, 3vw, 40px) * 0.75)',
    );
  });

  it('default returns the theme’s own values for the same properties', () => {
    const tokens = resolveDensityTokens(roomy, 'default');
    expect(Object.keys(tokens).sort()).toEqual([...DENSITY_TOKEN_NAMES].sort());
    expect(tokens['--spacing-4']).toBe('20px');
    expect(tokens['--spacing-3']).toBe('12px');
    expect(tokens['--text-body-size']).toBe(roomy.tokens['--text-body-size']);
  });
});

describe('<Theme density>', () => {
  it('default density renders exactly what a Theme without the prop renders', () => {
    const without = renderToString(
      <Theme theme={plain} mode="dark">
        <p>x</p>
      </Theme>,
    );
    const explicit = renderToString(
      <Theme theme={plain} mode="dark" density="default">
        <p>x</p>
      </Theme>,
    );
    expect(explicit).toBe(without);
    expect(without).not.toContain('style=');
    expect(without).not.toContain('data-astryx-density');
  });

  it('writes compact custom properties on the theme root in server HTML', () => {
    const html = renderToString(
      <Theme theme={plain} density="compact">
        <p>x</p>
      </Theme>,
    );
    expect(html).toContain('data-astryx-density="compact"');
    expect(html).toContain('--spacing-4:12px');
    expect(html).toContain('--text-body-size:0.8125rem');
  });

  it('works in light and dark mode', () => {
    for (const mode of ['light', 'dark'] as const) {
      const {container, unmount} = render(
        <Theme theme={plain} mode={mode} density="compact">
          <Probe />
        </Theme>,
      );
      const root = rootOf(container);
      expect(root.getAttribute('data-theme')).toBe(mode);
      expect(root.style.getPropertyValue('--spacing-3')).toBe('9px');
      unmount();
    }
  });

  it('provides SizeProvider "sm" to descendants in compact only', () => {
    const {getByTestId, unmount} = render(
      <Theme theme={plain} density="compact">
        <Probe />
      </Theme>,
    );
    expect(getByTestId('probe').dataset.size).toBe('sm');
    expect(getByTestId('probe').dataset.density).toBe('compact');
    unmount();

    const {getByTestId: get2} = render(
      <Theme theme={plain}>
        <Probe />
      </Theme>,
    );
    expect(get2('probe').dataset.size).toBe('md');
    expect(get2('probe').dataset.density).toBe('default');
  });

  it('a nested Theme inherits compact and re-derives it from its own theme', () => {
    const {container, getByTestId} = render(
      <Theme theme={plain} density="compact">
        <Theme theme={roomy}>
          <Probe />
        </Theme>
      </Theme>,
    );
    const inner = container.querySelector(
      '[data-astryx-theme="density-roomy"]',
    ) as HTMLElement;
    expect(inner.dataset.astryxDensity).toBe('compact');
    expect(inner.style.getPropertyValue('--spacing-4')).toBe('15px');
    expect(getByTestId('probe').dataset.size).toBe('sm');
  });

  it('a nested density="default" restores the standard scale', () => {
    const {container, getByTestId} = render(
      <Theme theme={plain} density="compact">
        <Theme theme={roomy} density="default">
          <Probe />
        </Theme>
      </Theme>,
    );
    const inner = container.querySelector(
      '[data-astryx-theme="density-roomy"]',
    ) as HTMLElement;
    expect(inner.dataset.astryxDensity).toBeUndefined();
    expect(inner.style.getPropertyValue('--spacing-4')).toBe('20px');
    expect(inner.style.getPropertyValue('--spacing-3')).toBe('12px');
    expect(getByTestId('probe').dataset.size).toBe('md');
    expect(getByTestId('probe').dataset.density).toBe('default');
  });

  it('a nested compact Theme inside a default one only affects its region', () => {
    const {container} = render(
      <Theme theme={plain}>
        <Theme theme={roomy} density="compact">
          <span />
        </Theme>
      </Theme>,
    );
    const outer = container.querySelector(
      '[data-astryx-theme="density-plain"]',
    ) as HTMLElement;
    const inner = container.querySelector(
      '[data-astryx-theme="density-roomy"]',
    ) as HTMLElement;
    expect(outer.getAttribute('style')).toBeNull();
    expect(inner.style.getPropertyValue('--spacing-4')).toBe('15px');
  });

  it('makes compact the default Table row density; an explicit prop wins', () => {
    const columns = [{key: 'name', header: 'Name'}];
    const data = [{name: 'a'}];
    const {container, unmount} = render(
      <Theme theme={plain} density="compact">
        <Table columns={columns} data={data} />
      </Theme>,
    );
    expect(container.querySelector('td')?.getAttribute('data-density')).toBe(
      'compact',
    );
    unmount();

    const {container: c2} = render(
      <Theme theme={plain} density="compact">
        <Table columns={columns} data={data} density="spacious" />
      </Theme>,
    );
    expect(c2.querySelector('td')?.getAttribute('data-density')).toBe(
      'spacious',
    );
  });

  it('makes nav items default to the small row; an explicit size wins', () => {
    const {container} = render(
      <Theme theme={plain} density="compact">
        <SideNavItem label="Inbox" />
        <SideNavItem label="Archive" size="lg" />
      </Theme>,
    );
    const items = container.querySelectorAll('.astryx-side-nav-item');
    expect(items[0]?.getAttribute('data-size')).toBe('sm');
    expect(items[1]?.getAttribute('data-size')).toBe('lg');
  });

  it('nav items keep md outside compact, even under another SizeProvider', () => {
    const {container} = render(<SideNavItem label="Inbox" />);
    expect(
      container
        .querySelector('.astryx-side-nav-item')
        ?.getAttribute('data-size'),
    ).toBe('md');
    cleanup();
    // Nav items follow the Theme density, not the generic size cascade.
    const {container: c2} = render(
      <SizeProvider value="lg">
        <SideNavItem label="Inbox" />
      </SizeProvider>,
    );
    expect(
      c2.querySelector('.astryx-side-nav-item')?.getAttribute('data-size'),
    ).toBe('md');
  });

  it('drawer TopNavItems default to the small row under compact; an explicit size wins', () => {
    const drawerClass = (node: React.ReactNode) => {
      const {container, unmount} = render(
        <TopNavRenderContext value="drawer">{node}</TopNavRenderContext>,
      );
      const cls = container.querySelector('a')?.className;
      unmount();
      return cls;
    };
    const md = drawerClass(<TopNavItem label="Home" href="#" />);
    const sm = drawerClass(<TopNavItem label="Home" href="#" size="sm" />);
    expect(md).not.toBe(sm);
    expect(
      drawerClass(
        <Theme theme={plain} density="compact">
          <TopNavItem label="Home" href="#" />
        </Theme>,
      ),
    ).toBe(sm);
    expect(
      drawerClass(
        <Theme theme={plain} density="compact">
          <TopNavItem label="Home" href="#" size="md" />
        </Theme>,
      ),
    ).toBe(md);
  });

  it('switching density back to default removes every written property', () => {
    const {container, rerender, getByTestId} = render(
      <Theme theme={plain} density="compact">
        <Probe />
      </Theme>,
    );
    expect(rootOf(container).style.getPropertyValue('--spacing-4')).toBe(
      '12px',
    );
    rerender(
      <Theme theme={plain} density="default">
        <Probe />
      </Theme>,
    );
    const root = rootOf(container);
    for (const name of DENSITY_TOKEN_NAMES) {
      expect(root.style.getPropertyValue(name)).toBe('');
    }
    expect(root.dataset.astryxDensity).toBeUndefined();
    expect(getByTestId('probe').dataset.size).toBe('md');
  });

  it('a nested compact Theme restores default for a deeper default region', () => {
    const {container} = render(
      <Theme theme={plain} density="compact">
        <Theme theme={plain}>
          <Theme theme={roomy} density="default">
            <span />
          </Theme>
        </Theme>
      </Theme>,
    );
    const themes = container.querySelectorAll<HTMLElement>(
      '[data-astryx-theme]',
    );
    expect(themes[1].style.getPropertyValue('--spacing-4')).toBe('12px');
    expect(themes[2].style.getPropertyValue('--spacing-4')).toBe('20px');
    expect(themes[2].style.getPropertyValue('--text-supporting-size')).toBe(
      '12px',
    );
  });

  it('nav heading hit boxes keep a small-control floor under compact spacing', () => {
    const {container} = render(
      <Theme theme={plain} density="compact">
        <SideNavHeading heading="Tracker" headingHref="#" />
        <TopNavHeading heading="Tracker" headingHref="#" />
      </Theme>,
    );
    const floors = ['.astryx-side-nav-heading', '.astryx-top-nav-heading'].map(
      sel => {
        const el = container.querySelector(sel);
        expect(el).not.toBeNull();
        const withMin = [el!, ...Array.from(el!.querySelectorAll('*'))].find(
          node => declaredValue(node, 'min-height'),
        );
        return declaredValue(withMin!, 'min-height');
      },
    );
    for (const value of floors) {
      expect(value).toMatch(
        /^max\(var\(--spacing-8\), ?var\(--size-element-sm\)\)$/,
      );
    }
  });

  it('keeps the Selector line box at least as tall as its 1rem indicator', () => {
    // Compact tightens --spacing-5 (the pinned line box) to 15px, under the
    // 16px indicator icon, which would grow the sm trigger to 29px next to
    // 28px Buttons and inputs. Selector floors its line box and padding
    // (at least 1rem), so compact density keeps it on its size token.
    const {container} = render(
      <Theme theme={plain} density="compact">
        <Selector
          label="Status"
          isLabelHidden
          value="all"
          onChange={() => {}}
          options={[{value: 'all', label: 'All'}]}
        />
      </Theme>,
    );
    const root = container.querySelector('.astryx-selector');
    expect(root).not.toBeNull();
    const nodes = [root!, ...Array.from(root!.querySelectorAll('*'))];
    const withLine = nodes.find(node =>
      declaredValue(node, 'line-height')?.includes('--spacing-5'),
    );
    expect(declaredValue(withLine!, 'line-height')).toMatch(
      /^max\(var\(--spacing-5\),.*\b1rem\)$/,
    );
    const withPad = nodes.find(node =>
      declaredValue(node, 'padding-block')?.includes('--size-element-sm'),
    );
    expect(declaredValue(withPad!, 'padding-block')).toContain(
      'max(var(--spacing-5)',
    );
  });

  it('useTheme().token() reads the same values the compact region renders', () => {
    function TokenProbe() {
      const {token} = useTheme();
      return (
        <span
          data-testid="tokens"
          data-spacing={token('--spacing-4')}
          data-body={token('--text-body-size')}
        />
      );
    }
    const {getAllByTestId, container} = render(
      <Theme theme={plain} density="compact">
        <TokenProbe />
        <Theme theme={roomy} density="default">
          <TokenProbe />
        </Theme>
      </Theme>,
    );
    const [compact, restored] = getAllByTestId('tokens');
    const root = rootOf(container);
    expect(compact.dataset.spacing).toBe(
      root.style.getPropertyValue('--spacing-4'),
    );
    expect(compact.dataset.body).toBe('0.8125rem');
    expect(restored.dataset.spacing).toBe('20px');
  });
});
