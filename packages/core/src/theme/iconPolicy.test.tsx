// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconPolicy.test.tsx
 * @input Defined themes, the existing provider and explicit Icon presentation
 * @output Source/default read, inheritance, geometry and SVG compatibility evidence
 * @position Core A theme tests; component participation is outside this suite
 */
import React, {type SVGProps} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {Theme} from './Theme';
import {ThemeContext} from './useTheme';
import {defineTheme} from './defineTheme';
import {resetThemes} from './themeRegistry';
import {Icon} from '../Icon/Icon';
import {
  defineIconCapabilities,
  getIconThemeContracts,
} from '../Icon/iconCapabilities';
import {defineAdaptiveIcon} from '../Icon/adaptiveIcons';
import {getIcon} from '../Icon/globalIconRegistry';
import {useIcon} from '../Icon/useIcon';
import {IconDefaultSizeProvider} from '../Icon/IconDefaultSizeContext';
import {iconBoxSizeStyles, iconSizeStyles} from '../Icon/IconSize.stylex';
import {resolveIconWithContext} from '../Icon/iconResolution';

const contract = defineIconCapabilities({
  sizes: {hero: {default: '2.5rem'}},
  appearances: ['outline', 'fill'],
  weights: {range: {min: 100, max: 900}},
});
const Weighted = ({weight}: {weight?: number}) => (
  <svg data-testid="artwork" data-weight={weight} />
);
const source = defineAdaptiveIcon(contract, {
  default: {render: Weighted, weightRange: {min: 100, max: 900}},
});
const Ordinary = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;
function hasDimension(
  element: HTMLElement | SVGElement,
  dimension: string,
): boolean {
  return [...Array(element.style.length).keys()].some(
    index =>
      element.style.getPropertyValue(element.style.item(index)) === dimension,
  );
}
function ReadIcon() {
  return <div data-testid="read">{useIcon('close')}</div>;
}

function contractSiblingFixture(accessors: boolean) {
  const valid = {sizes: {hero: {default: '40px'}}, appearances: ['fill']};
  const snapshot = defineIconCapabilities(valid);
  const contributors = [{appearances: ['']}, valid];
  const getter = vi.fn(() => {
    throw new Error('foreign contract array accessor executed');
  });
  if (accessors) {
    Object.defineProperties(contributors, {
      '0': {get: getter},
      map: {get: getter},
      [Symbol.iterator]: {get: getter},
    });
  }
  const theme = {
    name: `contract-siblings-${accessors ? 'accessors' : 'invalid'}`,
    tokens: {},
    __built: true as const,
    __iconContracts: contributors,
    iconCapabilities: {
      sizeOverrides: {hero: '47px'},
      presentation: {default: {appearance: 'fill'}},
    },
  };
  return {theme, snapshot, getter};
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetThemes();
});

describe('theme source and presentation', () => {
  it('preserves fixed-only authored map identity and omits capability metadata', () => {
    const icons = {close: <svg />};
    const theme = defineTheme({name: 'legacy-map', icons});
    expect(theme.icons).toBe(icons);
    expect(theme.iconCapabilities).toBeUndefined();
    expect(theme.__iconSources).toBeUndefined();
    expect(theme.__iconContracts).toBeUndefined();
  });
  it('separates productive source IR from actual default nodes', () => {
    const theme = defineTheme({
      name: 'source-view',
      icons: {close: source},
      iconCapabilities: {contract},
    });
    expect(theme.__iconSources?.close).toBe(source);
    expect(theme.__iconContracts).toContain(source.capabilities);
    expect(theme.iconCapabilities?.contract).toBe(source.capabilities);
    expect(Object.isFrozen(theme.__iconSources)).toBe(true);
    expect(React.isValidElement(theme.icons?.close)).toBe(true);
    expect((theme.icons?.close as React.ReactElement).props).toEqual({});
  });
  it('replaces an inherited adaptive entry atomically with fixed artwork', () => {
    const fixed = <svg data-art="replacement" />;
    const base = defineTheme({
      name: 'source-base',
      icons: {close: source},
      iconCapabilities: {contract},
    });
    const own = defineTheme({
      name: 'source-own',
      extends: base,
      icons: {close: fixed},
    });
    expect(own.__iconSources).toBeUndefined();
    expect(getIcon('close', own)).toBe(fixed);
  });
  it('applies default/per-size weights and lets explicit fractional intent win', () => {
    const theme = defineTheme({
      name: 'presentation',
      icons: {close: source},
      iconCapabilities: {
        contract,
        presentation: {
          default: {weight: 300.5},
          bySize: {sm: {weight: 700.25}},
        },
      },
    });
    const {rerender} = render(
      <Theme theme={theme}>
        <Icon icon="close" size="sm" />
      </Theme>,
    );
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'data-weight',
      '700.25',
    );
    rerender(
      <Theme theme={theme}>
        <Icon icon="close" size="sm" weight={450.125} />
      </Theme>,
    );
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'data-weight',
      '450.125',
    );
    rerender(
      <Theme theme={theme}>
        <Icon icon="close" />
      </Theme>,
    );
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'data-weight',
      '300.5',
    );
  });
  it('inherits only policy while useIcon reads the inner region source', () => {
    const outer = defineTheme({
      name: 'outer-policy',
      icons: {close: <svg data-art="outer" />},
      iconCapabilities: {contract, presentation: {default: {weight: 321.5}}},
    });
    const inner = defineTheme({name: 'inner-art', icons: {close: source}});
    render(
      <Theme theme={outer}>
        <Theme theme={inner}>
          <ReadIcon />
        </Theme>
      </Theme>,
    );
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'data-weight',
      '321.5',
    );
    expect(inner.iconCapabilities?.presentation).toBeUndefined();
    expect((getIcon('close', inner) as React.ReactElement).props).toEqual({});
  });
  it('clears inherited presentation without removing source-local admission', () => {
    const outer = defineTheme({
      name: 'outer-clear',
      iconCapabilities: {contract, presentation: {default: {weight: 321.5}}},
    });
    const inner = defineTheme({
      name: 'inner-clear',
      icons: {close: source},
      iconCapabilities: {presentation: null},
    });
    render(
      <Theme theme={outer}>
        <Theme theme={inner}>
          <ReadIcon />
        </Theme>
      </Theme>,
    );
    expect(screen.getByTestId('artwork')).not.toHaveAttribute('data-weight');
  });
  it.each([false, true])(
    'retains valid contract siblings in direct resolution (accessors: %s)',
    accessors => {
      const {theme, snapshot, getter} = contractSiblingFixture(accessors);
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');
      for (let read = 0; read < 2; read++) {
        const inspection = resolveIconWithContext(
          Ordinary,
          {size: 'hero'},
          theme,
        ).inspection;
        expect(inspection.capabilities.sizes.hero.default).toBe('40px');
        expect(inspection.dimension).toBe('47px');
        expect(inspection.size.admitted).toBe(true);
        expect(inspection.appearance.requested).toBe('fill');
        expect(inspection.appearance.admitted).toBe(true);
        expect(
          inspection.diagnostics.some(item => item.code === 'malformed-policy'),
        ).toBe(true);
        expect(defineIconCapabilities(theme.__iconContracts[1])).toBe(snapshot);
      }
      expect(getter).not.toHaveBeenCalled();
      expect(warning).not.toHaveBeenCalled();
    },
  );
  it.each([false, true])(
    'retains valid contributor identity and policy through root/nested Theme (accessors: %s)',
    accessors => {
      const {theme, snapshot, getter} = contractSiblingFixture(accessors);
      const inner = {
        name: 'contract-siblings-inner',
        tokens: {},
        __built: true as const,
      };
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');
      function InspectSiblings() {
        const effective = React.use(ThemeContext)?.theme;
        const inspection = resolveIconWithContext(
          Ordinary,
          {size: 'hero'},
          effective,
        ).inspection;
        return (
          <>
            <Icon icon={Ordinary} size="hero" data-testid="sibling-box" />
            <div
              data-testid="sibling-evidence"
              data-admitted={
                inspection.size.admitted && inspection.appearance.admitted
              }
              data-appearance={inspection.appearance.requested}
              data-malformed={inspection.diagnostics.some(
                item => item.code === 'malformed-policy',
              )}
              data-lineage={
                effective?.__iconContracts?.includes(snapshot) &&
                getIconThemeContracts(effective?.iconCapabilities).includes(
                  snapshot,
                )
              }
            />
          </>
        );
      }
      const {rerender} = render(
        <Theme theme={theme}>
          <InspectSiblings />
        </Theme>,
      );
      const assertSurvivors = () => {
        expect(hasDimension(screen.getByTestId('sibling-box'), '47px')).toBe(
          true,
        );
        const evidence = screen.getByTestId('sibling-evidence');
        expect(evidence).toHaveAttribute('data-admitted', 'true');
        expect(evidence).toHaveAttribute('data-appearance', 'fill');
        expect(evidence).toHaveAttribute('data-malformed', 'true');
        expect(evidence).toHaveAttribute('data-lineage', 'true');
      };
      assertSurvivors();
      rerender(
        <Theme theme={theme}>
          <Theme theme={inner}>
            <InspectSiblings />
          </Theme>
        </Theme>,
      );
      assertSurvivors();
      expect(getter).not.toHaveBeenCalled();
      expect(warning).not.toHaveBeenCalled();
    },
  );
  it('retains malformed root/nested policy evidence in production without getter execution', () => {
    const getter = vi.fn(() => {
      throw new Error('policy getter executed');
    });
    const bad = Object.defineProperty(
      {name: 'bad-policy', tokens: {}, __built: true as const},
      'iconCapabilities',
      {get: getter},
    );
    const inner = {
      ...defineTheme({name: 'safe-inner', icons: {close: source}}),
      __built: true as const,
    };
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    function Inspect() {
      const context = React.use(ThemeContext);
      const inspection = resolveIconWithContext(
        'close',
        {},
        context?.theme,
      ).inspection;
      return (
        <div
          data-testid="evidence"
          data-malformed={inspection.diagnostics.some(
            item => item.code === 'malformed-policy',
          )}
        />
      );
    }
    const {rerender} = render(
      <Theme theme={bad}>
        <Inspect />
      </Theme>,
    );
    expect(screen.getByTestId('evidence')).toHaveAttribute(
      'data-malformed',
      'true',
    );
    rerender(
      <Theme theme={bad}>
        <Theme theme={inner}>
          <Inspect />
        </Theme>
      </Theme>,
    );
    expect(screen.getByTestId('evidence')).toHaveAttribute(
      'data-malformed',
      'true',
    );
    expect(getter).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
});

describe('explicit versus legacy-context geometry', () => {
  const theme = defineTheme({
    name: 'dimension-overrides',
    iconCapabilities: {sizeOverrides: {sm: '31px', md: '37px'}},
  });
  it.each([
    ['sm', '31px'],
    ['md', '37px'],
  ] as const)(
    'uses theme %s dimensions for explicit registry sizes inside legacy context',
    (size, dimension) => {
      render(
        <Theme theme={theme}>
          <IconDefaultSizeProvider value="lg">
            <Icon icon="close" size={size} data-testid="box" />
          </IconDefaultSizeProvider>
        </Theme>,
      );
      expect(hasDimension(screen.getByTestId('box'), dimension)).toBe(true);
      expect(screen.getByTestId('box')).toHaveAttribute('data-size', size);
    },
  );
  it('uses the active theme dimension for standalone omitted md', () => {
    render(
      <Theme theme={theme}>
        <Icon icon="close" data-testid="box" />
      </Theme>,
    );
    expect(hasDimension(screen.getByTestId('box'), '37px')).toBe(true);
  });
  it('keeps implicit legacy sm on the released rem class despite a theme override', () => {
    render(
      <Theme theme={theme}>
        <IconDefaultSizeProvider value="sm">
          <Icon icon="close" data-testid="box" />
        </IconDefaultSizeProvider>
      </Theme>,
    );
    const box = screen.getByTestId('box');
    expect(hasDimension(box, '31px')).toBe(false);
    for (const token of stylex
      .props(iconBoxSizeStyles.sm)
      .className?.split(' ') ?? []) {
      expect(box).toHaveClass(token);
    }
    expect(box.style.length).toBe(0);
  });
  it.each(['registry', 'direct'] as const)(
    'keeps an unadmitted %s size equivalent to omission in legacy sm context',
    kind => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const icon = kind === 'registry' ? 'close' : Ordinary;
      const request = {size: 'not-admitted' as never};
      const inspection = resolveIconWithContext(icon, request, theme, {
        legacyContextSize: 'sm',
      }).inspection;
      expect(inspection.size.selected).toBe('sm');
      expect(inspection.size.admitted).toBe(false);
      expect(inspection.customDimension).toBe(false);
      expect(inspection.diagnostics).toContainEqual(
        expect.objectContaining({
          code: 'unadmitted',
          axis: 'size',
          provenance: 'explicit',
        }),
      );
      render(
        <Theme theme={theme}>
          <IconDefaultSizeProvider value="sm">
            <Icon icon={icon} data-testid="omitted" />
            <Icon icon={icon} {...request} data-testid="unadmitted" />
            <Icon icon={icon} size="sm" data-testid="admitted" />
          </IconDefaultSizeProvider>
        </Theme>,
      );
      const omitted = screen.getByTestId('omitted');
      const unadmitted = screen.getByTestId('unadmitted');
      expect(unadmitted).toHaveAttribute('data-size', 'sm');
      expect(unadmitted.getAttribute('class')).toBe(
        omitted.getAttribute('class'),
      );
      expect(unadmitted.style.length).toBe(0);
      expect(hasDimension(unadmitted, '31px')).toBe(false);
      expect(hasDimension(screen.getByTestId('admitted'), '31px')).toBe(true);
      expect(warning).toHaveBeenCalledWith(
        expect.stringContaining('Unadmitted size request'),
      );
    },
  );
  it('keeps no-capability standalone md and explicit direct sm root-font compatible', () => {
    const before = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '24px';
    try {
      render(
        <>
          <Icon icon="close" data-testid="box" />
          <Icon icon={Ordinary} size="sm" data-testid="direct" />
        </>,
      );
      const box = screen.getByTestId('box');
      const direct = screen.getByTestId('direct');
      for (const token of stylex
        .props(iconBoxSizeStyles.md)
        .className?.split(' ') ?? []) {
        expect(box).toHaveClass(token);
      }
      for (const token of stylex
        .props(iconSizeStyles.sm)
        .className?.split(' ') ?? []) {
        expect(direct).toHaveClass(token);
      }
      expect(box.style.length).toBe(0);
      expect(direct.style.length).toBe(0);
    } finally {
      document.documentElement.style.fontSize = before;
    }
  });
  it('uses explicit direct SVG dimensions without passing presentation props', () => {
    const callback = vi.fn();
    const ref = React.createRef<SVGSVGElement>();
    render(
      <Theme theme={theme}>
        <IconDefaultSizeProvider value="lg">
          <Icon
            icon={Ordinary}
            size="sm"
            appearance="fill"
            weight={350.5}
            role="presentation"
            aria-hidden="false"
            ref={ref}
            onClick={callback}
            data-testid="direct"
            className="consumer"
            style={{opacity: 0.5}}
          />
        </IconDefaultSizeProvider>
      </Theme>,
    );
    const direct = screen.getByTestId('direct');
    expect(hasDimension(direct, '31px')).toBe(true);
    expect(direct).not.toHaveAttribute('appearance');
    expect(direct).not.toHaveAttribute('weight');
    expect(direct).toHaveAttribute('role', 'presentation');
    expect(direct).toHaveAttribute('aria-hidden', 'false');
    expect(direct).toHaveClass('consumer');
    expect(direct).toHaveStyle({opacity: '0.5'});
    expect(ref.current).toBe(direct);
    direct.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(callback).toHaveBeenCalledOnce();
  });
  it('uses custom canonical dimensions and fractional source weight without new context enrollment', () => {
    const custom = defineTheme({
      name: 'custom-canonical',
      icons: {close: source},
    });
    render(
      <Theme theme={custom}>
        <Icon icon="close" size="hero" weight={123.125} data-testid="custom" />
      </Theme>,
    );
    expect(hasDimension(screen.getByTestId('custom'), '2.5rem')).toBe(true);
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'data-weight',
      '123.125',
    );
  });
  it('returns built-in null clearing to rem geometry and custom null clearing to canonical geometry', () => {
    const base = defineTheme({
      name: 'geometry-base',
      iconCapabilities: {contract, sizeOverrides: {md: '37px', hero: '3rem'}},
    });
    const own = defineTheme({
      name: 'geometry-clear',
      extends: base,
      iconCapabilities: {sizeOverrides: {md: null, hero: null}},
    });
    render(
      <Theme theme={own}>
        <Icon icon="close" data-testid="builtin" />
        <Icon icon="close" size="hero" data-testid="custom" />
      </Theme>,
    );
    expect(screen.getByTestId('builtin').style.length).toBe(0);
    expect(hasDimension(screen.getByTestId('custom'), '2.5rem')).toBe(true);
  });
});
