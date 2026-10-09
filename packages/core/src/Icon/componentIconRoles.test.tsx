// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentIconRoles.test.tsx
 * @input Synthetic downstream roles, source-only slots and private owner rendering
 * @output Role/state, precedence, transport containment and released-slot compatibility evidence
 * @position Focused infrastructure tests; not Core enrollment or real Button/browser proof
 */
import React, {type SVGProps} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {Icon} from './Icon';
import {
  declareComponentIconRole,
  getComponentIconRole,
  getComponentIconState,
  resetComponentIconRoles,
} from './componentIconRoles';
import {renderComponentIconSlot} from './componentIconSlot';
import {defineIconCapabilities} from './iconCapabilities';
import {defineAdaptiveIcon} from './adaptiveIcons';
import {
  getComponentIcon,
  getComponentIconName,
  getIcon,
  resetIcons,
} from './globalIconRegistry';
import {useComponentIcon, useComponentIconName} from './useIcon';
import {
  validateComponentIconMap,
  readComponentIconMap,
} from './componentIconMap';
import {resolveIconWithContext} from './iconResolution';
import {defineTheme, type DefinedTheme} from '../theme/defineTheme';
import {Theme} from '../theme/Theme';
import {resetThemes} from '../theme/themeRegistry';
import {IconDefaultSizeProvider} from './IconDefaultSizeContext';
import {__resetDevWarnings} from '../utils/devWarning';

const contract = defineIconCapabilities({
  sizes: {roleLarge: {default: '2.5rem'}},
  appearances: ['outline', 'filled', 'muted'],
  weights: {values: [400, 600]},
});
declare module './index' {
  interface IconCapabilityMap {
    cRoleFixture: typeof contract;
  }
  interface ComponentIconSlotMap {
    'fixture-action-icon': {
      slot: true;
      states: 'disabled' | 'pressed' | 'hovered';
    };
    'fixture-secondary-icon': {slot: true; states: 'selected'};
    'fixture-source-icon': {slot: true};
  }
}
const leaf = (art: string) => <svg data-testid="role-art" data-art={art} />;
const source = defineAdaptiveIcon(contract, {
  default: {
    default: leaf('outline-400'),
    byAppearance: {
      filled: {
        default: leaf('filled-400'),
        byWeight: {400: leaf('filled-400'), 600: leaf('filled-600')},
      },
      muted: {default: leaf('muted-400'), byWeight: {600: leaf('muted-600')}},
    },
    byWeight: {400: leaf('outline-400'), 600: leaf('outline-600')},
  },
  byAppearance: {
    filled: {
      default: leaf('filled-400'),
      byWeight: {400: leaf('filled-400'), 600: leaf('filled-600')},
    },
    muted: {default: leaf('muted-400'), byWeight: {600: leaf('muted-600')}},
  },
  bySize: {
    roleLarge: {
      default: {
        default: leaf('large-outline-400'),
        byWeight: {600: leaf('large-outline-600')},
      },
      byAppearance: {
        filled: {
          default: leaf('large-filled-400'),
          byWeight: {600: leaf('large-filled-600')},
        },
        muted: {
          default: leaf('large-muted-400'),
          byWeight: {600: leaf('large-muted-600')},
        },
      },
    },
  },
});
function declareAction() {
  return declareComponentIconRole({
    slot: 'fixture-action-icon',
    defaultSize: 'sm',
    statePrecedence: ['disabled', 'pressed', 'hovered'],
  });
}
function makeTheme() {
  return defineTheme({
    name: 'synthetic-role-policy',
    icons: {close: source, check: source},
    componentIcons: {'fixture-action-icon': 'check'},
    iconCapabilities: {
      contract,
      sizeOverrides: {roleLarge: '43px', sm: '19px'},
      roleSizeOverrides: {'fixture-action-icon': 'roleLarge'},
      presentation: {
        default: {appearance: 'outline', weight: 400},
        bySize: {roleLarge: {weight: 600}},
        byState: {
          disabled: {appearance: 'muted'},
          pressed: {appearance: 'filled'},
        },
      },
    },
  });
}
function asBuilt(theme: DefinedTheme): DefinedTheme {
  return {...theme, __built: true};
}
function hasDimension(element: HTMLElement | SVGElement, dimension: string) {
  return [...Array(element.style.length).keys()].some(
    index =>
      element.style.getPropertyValue(element.style.item(index)) === dimension,
  );
}

beforeEach(() => {
  resetComponentIconRoles();
  resetIcons();
  resetThemes();
  __resetDevWarnings();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetComponentIconRoles();
  resetThemes();
});

describe('owner declarations and finite state selection', () => {
  it('snapshots precedence and reuses only identical owner declarations', () => {
    const order: ['disabled', 'pressed', 'hovered'] = [
      'disabled',
      'pressed',
      'hovered',
    ];
    const role = declareComponentIconRole({
      slot: 'fixture-action-icon',
      defaultSize: 'sm',
      statePrecedence: order,
    });
    order.reverse();
    expect(role.statePrecedence).toEqual(['disabled', 'pressed', 'hovered']);
    expect(Object.isFrozen(role)).toBe(true);
    expect(Object.isFrozen(role.states)).toBe(true);
    expect(declareAction()).toBe(role);
    expect(() =>
      declareComponentIconRole({
        slot: 'fixture-action-icon',
        defaultSize: 'md',
        statePrecedence: ['disabled', 'pressed', 'hovered'],
      }),
    ).toThrow(/conflicting/);
  });
  it('selects only one true condition by owner precedence, independent of object order', () => {
    declareAction();
    expect(
      getComponentIconState('fixture-action-icon', {
        hovered: true,
        pressed: true,
        disabled: true,
      }),
    ).toBe('disabled');
    expect(
      getComponentIconState('fixture-action-icon', {
        disabled: false,
        hovered: true,
        pressed: true,
      }),
    ).toBe('pressed');
    expect(getComponentIconState('fixture-action-icon', {})).toBeUndefined();
    expect(
      getComponentIconState('fixture-secondary-icon', {selected: true}),
    ).toBeUndefined();
  });
  it('ignores malformed own state conditions without evaluating getters', () => {
    declareAction();
    const getter = vi.fn(() => true);
    const conditions = Object.defineProperty({pressed: true}, 'disabled', {
      get: getter,
    });
    expect(getComponentIconState('fixture-action-icon', conditions)).toBe(
      'pressed',
    );
    expect(getter).not.toHaveBeenCalled();
    expect(
      getComponentIconState('fixture-action-icon', {disabled: 'true'} as never),
    ).toBeUndefined();
    expect(
      getComponentIconState(
        'fixture-action-icon',
        Object.create({disabled: true}),
      ),
    ).toBeUndefined();
  });
  it.each([
    {slot: 'bad:name', defaultSize: 'sm', statePrecedence: ['pressed']},
    {
      slot: 'fixture-action-icon',
      defaultSize: '',
      statePrecedence: ['pressed'],
    },
    {slot: 'fixture-action-icon', defaultSize: 'sm', statePrecedence: []},
    {
      slot: 'fixture-action-icon',
      defaultSize: 'sm',
      statePrecedence: ['pressed', 'pressed'],
    },
    {
      slot: 'fixture-action-icon',
      defaultSize: 'sm',
      statePrecedence: ['constructor'],
    },
    {
      slot: 'fixture-action-icon',
      defaultSize: 'sm',
      statePrecedence: ['bad\u0000state'],
    },
  ])('rejects malformed role declarations %#', input => {
    expect(() => declareComponentIconRole(input as never)).toThrow();
  });
  it('rejects precedence accessors without executing them', () => {
    const getter = vi.fn(() => 'pressed');
    const order = Object.defineProperty(['pressed'], '0', {get: getter});
    expect(() =>
      declareComponentIconRole({
        slot: 'fixture-action-icon',
        defaultSize: 'sm',
        statePrecedence: order,
      } as never),
    ).toThrow();
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('approved source-only component slot contract', () => {
  it('keeps exact lookup arities and source-only node behavior', () => {
    const theme = defineTheme({
      name: 'source-only-slot',
      componentIcons: {'fixture-source-icon': 'check'},
    });
    expect(getComponentIconName.length).toBe(3);
    expect(getComponentIcon.length).toBe(3);
    expect(useComponentIconName.length).toBe(2);
    expect(useComponentIcon.length).toBe(2);
    expect(getComponentIconName('fixture-source-icon', 'close', theme)).toBe(
      'check',
    );
    expect(getComponentIcon('fixture-source-icon', 'close', theme)).toBe(
      getIcon('check', theme),
    );
    expect(
      getComponentIconName('fixture-source-icon', 'close', theme.name),
    ).toBe('check');
    expect(getComponentIconRole('fixture-source-icon')).toBeUndefined();
  });
  it('inherits mappings, skips undefined and preserves null suppression', () => {
    const base = defineTheme({
      name: 'source-map-base',
      componentIcons: {'fixture-source-icon': 'check'},
    });
    const inherit = defineTheme({
      name: 'source-map-inherit',
      extends: base,
      componentIcons: {'fixture-source-icon': undefined},
    });
    const cleared = defineTheme({
      name: 'source-map-clear',
      extends: base,
      componentIcons: {'fixture-source-icon': null},
    });
    expect(getComponentIconName('fixture-source-icon', 'close', inherit)).toBe(
      'check',
    );
    expect(
      getComponentIcon('fixture-source-icon', 'close', cleared),
    ).toBeNull();
    expect(
      getComponentIconName('fixture-secondary-icon', null, inherit),
    ).toBeNull();
  });
  it('retains hook parity from nearest effective nested Theme', () => {
    const outer = defineTheme({
      name: 'source-outer',
      componentIcons: {'fixture-source-icon': 'check'},
      icons: {check: <svg data-art="outer" />},
    });
    const inner = defineTheme({
      name: 'source-inner',
      icons: {check: <svg data-art="inner" />},
    });
    function Read() {
      return (
        <div
          data-testid="slot-read"
          data-name={
            useComponentIconName('fixture-source-icon', 'close') ?? 'none'
          }>
          {useComponentIcon('fixture-source-icon', 'close')}
        </div>
      );
    }
    render(
      <Theme theme={asBuilt(outer)}>
        <Theme theme={asBuilt(inner)}>
          <Read />
        </Theme>
      </Theme>,
    );
    expect(screen.getByTestId('slot-read')).toHaveAttribute(
      'data-name',
      'check',
    );
    expect(
      screen.getByTestId('slot-read').querySelector('svg'),
    ).toHaveAttribute('data-art', 'inner');
  });
  it('strictly rejects artwork/namespaced mapping and never reads malformed runtime accessors', () => {
    expect(() =>
      validateComponentIconMap({'fixture-source-icon': 'other:check'}),
    ).toThrow();
    expect(() =>
      validateComponentIconMap({'fixture-source-icon': <svg />}),
    ).toThrow();
    const getter = vi.fn(() => 'check');
    const invalid = vi.fn();
    const map = Object.defineProperty(
      {'fixture-secondary-icon': null},
      'fixture-source-icon',
      {get: getter},
    );
    const safe = readComponentIconMap(map, invalid);
    expect(safe).toEqual({'fixture-secondary-icon': null});
    expect(invalid).toHaveBeenCalled();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      getComponentIconName('fixture-source-icon', 'close', {
        name: 'foreign-map',
        tokens: {},
        componentIcons: map,
      }),
    ).toBe('close');
    expect(warning).toHaveBeenCalledTimes(1);
    expect(getter).not.toHaveBeenCalled();
  });
  it('does not promote a true slot by mapping or state/sizing theme fields', () => {
    const theme = defineTheme({
      name: 'true-slot-does-not-participate',
      icons: {close: source},
      iconCapabilities: {
        contract,
        roleSizeOverrides: {'fixture-source-icon': 'roleLarge'} as never,
        presentation: {
          default: {appearance: 'outline'},
          byState: {pressed: {appearance: 'filled'}},
        },
      },
    });
    const resolution = resolveIconWithContext('close', {}, theme, {
      slot: 'fixture-source-icon',
      state: 'pressed',
      legacyContextSize: 'sm',
    });
    expect(resolution.inspection.size.selected).toBe('sm');
    expect(resolution.inspection.dimension).toBe('16px');
    expect(resolution.inspection.appearance.requested).toBe('outline');
    expect(getComponentIconRole('fixture-source-icon')).toBeUndefined();
  });
});

describe('private participant rendering and state policy', () => {
  it('uses final role size then bySize weight, with effective state changing only appearance', () => {
    declareAction();
    const theme = makeTheme();
    const state = getComponentIconState('fixture-action-icon', {
      disabled: true,
      pressed: true,
    });
    render(
      <Theme theme={asBuilt(theme)}>
        {renderComponentIconSlot(
          'fixture-action-icon',
          'close',
          {'data-testid': 'role-box'},
          state,
        )}
      </Theme>,
    );
    expect(screen.getByTestId('role-art')).toHaveAttribute(
      'data-art',
      'large-muted-600',
    );
    expect(screen.getByTestId('role-box')).toHaveAttribute(
      'data-size',
      'roleLarge',
    );
    expect(hasDimension(screen.getByTestId('role-box'), '43px')).toBe(true);
    const ordinaryState = resolveIconWithContext('close', {}, theme, {
      slot: 'fixture-action-icon',
      state: 'pressed',
    }).inspection;
    const disabledState = resolveIconWithContext('close', {}, theme, {
      slot: 'fixture-action-icon',
      state: 'disabled',
    }).inspection;
    expect(ordinaryState.weight.selected).toBe(600);
    expect(disabledState.weight.selected).toBe(600);
  });
  it('keeps explicit size/appearance/weight authoritative and role null returns to owner default', () => {
    declareAction();
    const base = makeTheme();
    const cleared = defineTheme({
      name: 'role-clear',
      extends: base,
      iconCapabilities: {roleSizeOverrides: {'fixture-action-icon': null}},
    });
    const implicit = resolveIconWithContext('close', {}, cleared, {
      slot: 'fixture-action-icon',
      state: 'pressed',
    }).inspection;
    expect(implicit.size.selected).toBe('sm');
    expect(implicit.dimension).toBe('19px');
    const explicit = resolveIconWithContext(
      'close',
      {size: 'md', appearance: 'filled', weight: 400},
      base,
      {slot: 'fixture-action-icon', state: 'disabled'},
    ).inspection;
    expect(explicit.size.selected).toBe('md');
    expect(explicit.appearance.selected).toBe('filled');
    expect(explicit.weight.selected).toBe(400);
  });
  it('ignores another role state and undeclared state without inventing a vocabulary', () => {
    declareAction();
    const theme = makeTheme();
    for (const state of ['selected', 'unknown', undefined]) {
      const result = resolveIconWithContext('close', {}, theme, {
        slot: 'fixture-action-icon',
        state,
      }).inspection;
      expect(result.appearance.requested).toBe('outline');
      expect(result.weight.requested).toBe(600);
    }
  });
  it('keeps late role declarations usable even after theme normalization and resolution caches', () => {
    const theme = makeTheme();
    expect(
      resolveIconWithContext('close', {}, theme, {
        slot: 'fixture-action-icon',
        state: 'pressed',
      }).inspection.size.selected,
    ).toBe('md');
    declareAction();
    const result = resolveIconWithContext('close', {}, theme, {
      slot: 'fixture-action-icon',
      state: 'pressed',
    }).inspection;
    expect(result.size.selected).toBe('roleLarge');
    expect(result.appearance.requested).toBe('filled');
  });
  it('retains final box when adaptive artwork has no supplied size branch', () => {
    declareAction();
    const sparse = defineAdaptiveIcon(contract, {default: leaf('sparse')});
    const theme = defineTheme({
      name: 'sparse-role',
      icons: {close: sparse},
      iconCapabilities: {
        contract,
        roleSizeOverrides: {'fixture-action-icon': 'roleLarge'},
        sizeOverrides: {roleLarge: '47px'},
      },
    });
    render(
      <Theme theme={asBuilt(theme)}>
        {renderComponentIconSlot('fixture-action-icon', 'close', {
          'data-testid': 'sparse-box',
        })}
      </Theme>,
    );
    expect(screen.getByTestId('role-art')).toHaveAttribute(
      'data-art',
      'sparse',
    );
    expect(hasDimension(screen.getByTestId('sparse-box'), '47px')).toBe(true);
  });
  it('cannot spoof owner role/state/default size from public props and preserves native SVG role', () => {
    declareAction();
    const theme = makeTheme();
    const spoof = {
      iconRole: 'fixture-action-icon',
      iconState: 'pressed',
      state: 'disabled',
      defaultSize: 'roleLarge',
      __iconRole: 'fixture-action-icon',
      __iconState: 'pressed',
      __iconDefaultSize: 'roleLarge',
    };
    const Ordinary = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;
    render(
      <Theme theme={asBuilt(theme)}>
        <Icon
          icon={Ordinary}
          {...spoof}
          data-testid="ordinary-spoof"
          role="img"
          aria-label="Synthetic glyph"
        />
        {renderComponentIconSlot(
          'fixture-action-icon',
          'close',
          {...spoof, 'data-testid': 'owned-spoof'},
          'pressed',
        )}
      </Theme>,
    );
    expect(screen.getByTestId('ordinary-spoof')).toHaveAttribute(
      'data-size',
      'md',
    );
    expect(screen.getByTestId('ordinary-spoof')).toHaveAttribute('role', 'img');
    expect(screen.getByTestId('role-art')).toHaveAttribute(
      'data-art',
      'large-filled-600',
    );
    for (const element of [
      screen.getByTestId('ordinary-spoof'),
      screen.getByTestId('owned-spoof'),
    ]) {
      for (const key of Object.keys(spoof)) {
        expect(element).not.toHaveAttribute(key);
      }
    }
  });
  it('contains transport to the selected Icon, not nested artwork Icons', () => {
    declareAction();
    const Nested = () => <Icon icon="check" data-testid="nested-icon" />;
    render(
      <Theme theme={asBuilt(makeTheme())}>
        {renderComponentIconSlot(
          'fixture-action-icon',
          Nested,
          {'data-testid': 'outer-icon'},
          'pressed',
        )}
      </Theme>,
    );
    expect(screen.getByTestId('nested-icon')).toHaveAttribute(
      'data-size',
      'md',
    );
    expect(screen.getByTestId('role-art')).toHaveAttribute(
      'data-art',
      'outline-400',
    );
  });
  it('leaves legacy implicit sizing separate from participating theme dimensions', () => {
    declareAction();
    const theme = makeTheme();
    render(
      <Theme theme={asBuilt(theme)}>
        <IconDefaultSizeProvider value="sm">
          <Icon icon="close" data-testid="legacy" />
          {renderComponentIconSlot('fixture-action-icon', 'check', {
            'data-testid': 'participant',
          })}
        </IconDefaultSizeProvider>
      </Theme>,
    );
    expect(screen.getByTestId('legacy')).toHaveAttribute('data-size', 'sm');
    expect(hasDimension(screen.getByTestId('legacy'), '19px')).toBe(false);
    expect(hasDimension(screen.getByTestId('participant'), '43px')).toBe(true);
  });
});
