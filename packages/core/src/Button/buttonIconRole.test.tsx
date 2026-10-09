// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file buttonIconRole.test.tsx
 * @input Button, IconButton, ToggleButton and ButtonGroup with the `button-leading` role
 * @output Runtime, type, default-pixel, shared-box geometry, state-appearance,
 *   source-override, accessibility, interaction and SSR evidence
 * @position First real consumer of the component icon role/state infrastructure;
 *   jsdom evidence only — real-browser boxes live in ButtonIconRole.stories.tsx
 */
import React, {act, createRef, useState, type SVGProps} from 'react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BUTTON_PATTERN,
  TOGGLE_BUTTON_PATTERN,
  expectAccessibilitySpec,
} from '@astryxdesign/a11y-spec';
import {Button, type ButtonProps} from './Button';
import {
  buttonLeadingIconRole,
  getButtonLeadingIconState,
} from './buttonIconRole';
import {IconButton} from '../IconButton/IconButton';
import {ToggleButton} from '../ToggleButton/ToggleButton';
import {ToggleButtonGroup} from '../ToggleButton/ToggleButtonGroup';
import {ButtonGroup} from '../ButtonGroup';
import {Icon} from '../Icon/Icon';
import type {
  ComponentIconStateName,
  IconThemeCapabilitiesInput,
  ParticipatingComponentIconSlotName,
} from '../Icon/index';
import {getComponentIconRole} from '../Icon/componentIconRoles';
import {defineIconCapabilities} from '../Icon/iconCapabilities';
import {defineAdaptiveIcon} from '../Icon/adaptiveIcons';
import {Theme} from '../theme/Theme';
import {defineTheme, type DefinedTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {__resetDevWarnings} from '../utils/devWarning';
import {BUTTON_KNOWN_FAILURES} from './__tests__/Button.a11y.known-failures';
import {BUTTON_BINDING_STATES} from './__tests__/Button.a11y.states';
import {TOGGLE_BUTTON_BINDING_STATES} from '../ToggleButton/__tests__/ToggleButton.a11y.states';

// =============================================================================
// Fixtures
// =============================================================================

const contract = defineIconCapabilities({
  sizes: {buttonRoleLarge: {default: '2.5rem'}},
  appearances: ['outline', 'filled', 'muted', 'busy'],
  weights: {values: [400, 600]},
});
declare module '../Icon/index' {
  interface IconCapabilityMap {
    buttonRoleProof: typeof contract;
  }
}

const leaf = (art: string) => <svg data-testid="role-art" data-art={art} />;
const weights = (prefix: string, appearance: string) => ({
  default: leaf(`${prefix}${appearance}-400`),
  byWeight: {
    400: leaf(`${prefix}${appearance}-400`),
    600: leaf(`${prefix}${appearance}-600`),
  },
});
const appearances = (prefix: string) => ({
  default: weights(prefix, 'outline'),
  byAppearance: {
    outline: weights(prefix, 'outline'),
    filled: weights(prefix, 'filled'),
    muted: weights(prefix, 'muted'),
    busy: weights(prefix, 'busy'),
  },
});
const source = defineAdaptiveIcon(contract, {
  default: appearances(''),
  bySize: {buttonRoleLarge: appearances('large-')},
});
const sparse = defineAdaptiveIcon(contract, {default: leaf('sparse')});

const presentation = {
  default: {appearance: 'outline', weight: 400},
  bySize: {buttonRoleLarge: {weight: 600}},
  byState: {
    disabled: {appearance: 'muted'},
    pressed: {appearance: 'filled'},
    loading: {appearance: 'busy'},
  },
} as const;

function asBuilt(theme: DefinedTheme): DefinedTheme {
  return {...theme, __built: true};
}
const policyTheme = asBuilt(
  defineTheme({
    name: 'button-role-policy',
    icons: {close: source, check: source, search: sparse},
    iconCapabilities: {
      contract,
      sizeOverrides: {sm: '19px', md: '23px', buttonRoleLarge: '43px'},
      presentation,
    },
  }),
);
const roleSizeTheme = asBuilt(
  defineTheme({
    name: 'button-role-size',
    extends: policyTheme,
    iconCapabilities: {
      roleSizeOverrides: {'button-leading': 'buttonRoleLarge'},
    },
  }),
);
const roleClearedTheme = asBuilt(
  defineTheme({
    name: 'button-role-cleared',
    extends: roleSizeTheme,
    iconCapabilities: {roleSizeOverrides: {'button-leading': null}},
  }),
);
const noPolicyTheme = asBuilt(defineTheme({name: 'button-role-no-policy'}));

/** Dynamic StyleX dimensions land as inline custom-property values. */
function hasDimension(element: Element, dimension: string): boolean {
  const {style} = element as HTMLElement;
  return [...Array(style.length).keys()].some(
    index => style.getPropertyValue(style.item(index)) === dimension,
  );
}
function glyph(testId = 'glyph'): HTMLElement {
  return screen.getByTestId(testId);
}
function wrapperOf(element: Element): HTMLElement {
  const wrapper = element.parentElement;
  if (wrapper === null) {
    throw new Error('Missing Button icon wrapper');
  }
  return wrapper;
}
function art(): string | null {
  return screen.getByTestId('role-art').getAttribute('data-art');
}
/** Released markup: a Fragment is not a direct Icon, so it takes the legacy path. */
function released(icon: React.ReactElement) {
  return <>{icon}</>;
}

beforeEach(() => {
  resetThemes();
  __resetDevWarnings();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// Role metadata and effective state
// =============================================================================

describe('button-leading role declaration', () => {
  it('declares one immutable role with the family default and finite precedence', () => {
    expect(getComponentIconRole('button-leading')).toBe(buttonLeadingIconRole);
    expect(buttonLeadingIconRole).toEqual({
      slot: 'button-leading',
      defaultSize: 'sm',
      states: ['disabled', 'pressed', 'loading'],
      statePrecedence: ['disabled', 'pressed', 'loading'],
    });
    expect(Object.isFrozen(buttonLeadingIconRole)).toBe(true);
    expect(Object.isFrozen(buttonLeadingIconRole.statePrecedence)).toBe(true);
  });

  it.each([
    [{disabled: false, pressed: false, loading: false}, undefined],
    [{disabled: false, pressed: false, loading: true}, 'loading'],
    [{disabled: false, pressed: true, loading: true}, 'pressed'],
    [{disabled: true, pressed: true, loading: true}, 'disabled'],
    [{disabled: true, pressed: false, loading: false}, 'disabled'],
  ] as const)('selects one effective state from %j', (conditions, expected) => {
    expect(getButtonLeadingIconState(conditions)).toBe(expected);
  });

  it('exposes only finite Button states and no role/state props on Button', () => {
    expectTypeOf<ComponentIconStateName<'button-leading'>>().toEqualTypeOf<
      'disabled' | 'pressed' | 'loading'
    >();
    expectTypeOf<
      Extract<ParticipatingComponentIconSlotName, 'button-leading'>
    >().toEqualTypeOf<'button-leading'>();
    expectTypeOf<
      Extract<
        keyof ButtonProps,
        'iconRole' | 'iconState' | 'iconDefaultSize' | 'iconSlot'
      >
    >().toEqualTypeOf<never>();
    const policy: IconThemeCapabilitiesInput<typeof contract> = {
      contract,
      roleSizeOverrides: {'button-leading': 'buttonRoleLarge'},
      presentation: {
        byState: {
          pressed: {appearance: 'filled'},
          disabled: {appearance: 'muted'},
          loading: {appearance: 'busy'},
        },
      },
    };
    const noStateWeight: IconThemeCapabilitiesInput<typeof contract> = {
      presentation: {
        byState: {
          pressed: {
            appearance: 'filled',
            // @ts-expect-error A Button state never selects weight.
            weight: 600,
          },
        },
      },
    };
    const noInventedState: IconThemeCapabilitiesInput<typeof contract> = {
      presentation: {
        byState: {
          // @ts-expect-error Button reports no focus state; CSS owns focus.
          focused: {appearance: 'filled'},
        },
      },
    };
    expect([policy, noStateWeight, noInventedState]).toHaveLength(3);
  });
});

// =============================================================================
// Default pixels: no theme policy keeps the released markup exactly
// =============================================================================

describe('default pixels', () => {
  it.each([
    ['sm', 'sm', '1rem'],
    ['md', 'sm', '1rem'],
    ['lg', 'md', '1.25rem'],
  ] as const)(
    '%s control: participating markup equals the released markup',
    (size, iconSize, rendered) => {
      for (const theme of [undefined, noPolicyTheme]) {
        const tree = (icon: React.ReactElement) => (
          <Button label="Save" size={size} icon={icon} />
        );
        const {container: participating, unmount} = render(
          theme ? (
            <Theme theme={theme}>{tree(<Icon icon="check" />)}</Theme>
          ) : (
            tree(<Icon icon="check" />)
          ),
        );
        const participatingHtml = participating.innerHTML;
        const icon = participating.querySelector('.astryx-icon');
        expect(icon).toHaveAttribute('data-size', iconSize);
        expect(getComputedStyle(icon!).width).toBe(rendered);
        expect(getComputedStyle(wrapperOf(icon!)).width).toBe(rendered);
        unmount();
        const {container: legacy} = render(
          theme ? (
            <Theme theme={theme}>{tree(released(<Icon icon="check" />))}</Theme>
          ) : (
            tree(released(<Icon icon="check" />))
          ),
        );
        expect(participatingHtml).toBe(legacy.innerHTML);
        cleanup();
      }
    },
  );

  it('keeps IconButton, ToggleButton and grouped markup identical without policy', () => {
    const cases = (icon: () => React.ReactElement) => (
      <>
        <IconButton label="Add" icon={icon()} size="lg" />
        <ToggleButton label="Bold" icon={icon()} isPressed />
        <ButtonGroup label="Actions">
          <Button label="One" icon={icon()} />
        </ButtonGroup>
        <Button label="Busy" icon={icon()} isLoading />
        <Button label="Off" icon={icon()} isDisabled />
      </>
    );
    const {container, unmount} = render(cases(() => <Icon icon="check" />));
    const participatingHtml = container.innerHTML;
    unmount();
    const {container: legacy} = render(
      cases(() => released(<Icon icon="check" />)),
    );
    expect(participatingHtml).toBe(legacy.innerHTML);
  });

  it('leaves the control box and label untouched by participation', () => {
    render(
      <Theme theme={roleSizeTheme}>
        <Button label="Role" icon={<Icon icon="check" />} data-testid="a" />
        <Button
          label="Role"
          icon={released(<Icon icon="check" />)}
          data-testid="b"
        />
      </Theme>,
    );
    const [a, b] = [screen.getByTestId('a'), screen.getByTestId('b')];
    // The control's own box (height, padding, gap, variant) and the label
    // span are independent of how its icon resolves.
    expect(a.className).toBe(b.className);
    const [labelA, labelB] = screen.getAllByText('Role');
    expect(labelA.className).toBe(labelB.className);
    expect(labelA.parentElement?.className).toBe(
      labelB.parentElement?.className,
    );
  });
});

// =============================================================================
// Geometry: wrapper and glyph share one final theme dimension
// =============================================================================

describe('shared wrapper and glyph geometry', () => {
  it.each([
    ['sm', 'sm', '19px'],
    ['md', 'sm', '19px'],
    ['lg', 'md', '23px'],
  ] as const)(
    '%s control uses the theme dimension of its family default',
    (size, iconSize, dimension) => {
      render(
        <Theme theme={policyTheme}>
          <Button
            label="Save"
            size={size}
            icon={<Icon icon="check" data-testid="glyph" />}
          />
        </Theme>,
      );
      expect(glyph()).toHaveAttribute('data-size', iconSize);
      expect(hasDimension(glyph(), dimension)).toBe(true);
      expect(hasDimension(wrapperOf(glyph()), dimension)).toBe(true);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)(
    'a role-size override wins over the %s control default and selects bySize weight',
    size => {
      render(
        <Theme theme={roleSizeTheme}>
          <Button
            label="Save"
            size={size}
            icon={<Icon icon="check" data-testid="glyph" />}
          />
        </Theme>,
      );
      expect(glyph()).toHaveAttribute('data-size', 'buttonRoleLarge');
      expect(hasDimension(glyph(), '43px')).toBe(true);
      expect(hasDimension(wrapperOf(glyph()), '43px')).toBe(true);
      expect(art()).toBe('large-outline-600');
    },
  );

  it('null role-size clears back to the control default', () => {
    render(
      <Theme theme={roleClearedTheme}>
        <Button
          label="Save"
          size="lg"
          icon={<Icon icon="check" data-testid="glyph" />}
        />
      </Theme>,
    );
    expect(glyph()).toHaveAttribute('data-size', 'md');
    expect(hasDimension(wrapperOf(glyph()), '23px')).toBe(true);
    expect(art()).toBe('outline-400');
  });

  it('an explicit Icon size wins and the wrapper follows the same resolution', () => {
    render(
      <Theme theme={roleSizeTheme}>
        <Button
          label="Save"
          size="sm"
          icon={<Icon icon="check" size="md" data-testid="glyph" />}
        />
      </Theme>,
    );
    expect(glyph()).toHaveAttribute('data-size', 'md');
    expect(hasDimension(glyph(), '23px')).toBe(true);
    expect(hasDimension(wrapperOf(glyph()), '23px')).toBe(true);
  });

  it('an explicit built-in size without policy shares the released box of that size', () => {
    render(
      <>
        <Button
          label="Explicit"
          size="md"
          icon={<Icon icon="check" size="md" data-testid="explicit" />}
        />
        <Button
          label="Default lg"
          size="lg"
          icon={<Icon icon="check" data-testid="family" />}
        />
      </>,
    );
    expect(wrapperOf(glyph('explicit')).className).toBe(
      wrapperOf(glyph('family')).className,
    );
    expect(getComputedStyle(wrapperOf(glyph('explicit'))).width).toBe(
      '1.25rem',
    );
  });

  it('keeps the final box when sparse artwork has no size branch', () => {
    render(
      <Theme theme={roleSizeTheme}>
        <IconButton
          label="Search"
          icon={<Icon icon="search" data-testid="glyph" />}
        />
      </Theme>,
    );
    expect(art()).toBe('sparse');
    expect(hasDimension(glyph(), '43px')).toBe(true);
    expect(hasDimension(wrapperOf(glyph()), '43px')).toBe(true);
  });

  it('keeps the released box and context for content that is not a direct Icon', () => {
    render(
      <Theme theme={roleSizeTheme}>
        <Button
          label="Emoji"
          icon={<span data-testid="emoji">🚀</span>}
          data-testid="emoji-button"
        />
        <Button
          label="Nested"
          icon={
            <span>
              <Icon icon="check" data-testid="nested" />
            </span>
          }
        />
        <Button label="Reference" icon={released(<Icon icon="close" />)} />
      </Theme>,
    );
    const reference = screen
      .getByRole('button', {name: 'Reference'})
      .querySelector('[data-size]')!;
    expect(wrapperOf(glyph('emoji')).className).toBe(
      wrapperOf(reference).className,
    );
    expect(hasDimension(wrapperOf(glyph('emoji')), '43px')).toBe(false);
    expect(glyph('nested')).toHaveAttribute('data-size', 'sm');
    expect(hasDimension(glyph('nested'), '19px')).toBe(false);
    expect(hasDimension(glyph('nested'), '43px')).toBe(false);
  });

  it('switches box and artwork together when the active theme changes', () => {
    const tree = (theme: DefinedTheme) => (
      <Theme theme={theme}>
        <Button label="Save" icon={<Icon icon="check" data-testid="glyph" />} />
      </Theme>
    );
    const {rerender} = render(tree(policyTheme));
    expect(hasDimension(wrapperOf(glyph()), '19px')).toBe(true);
    rerender(tree(roleSizeTheme));
    expect(hasDimension(wrapperOf(glyph()), '43px')).toBe(true);
    expect(hasDimension(glyph(), '43px')).toBe(true);
    expect(art()).toBe('large-outline-600');
  });

  it('nested themes resolve the nearest policy for wrapper and glyph', () => {
    render(
      <Theme theme={policyTheme}>
        <Button
          label="Outer"
          icon={<Icon icon="check" data-testid="outer" />}
        />
        <Theme theme={roleSizeTheme}>
          <Button
            label="Inner"
            icon={<Icon icon="close" data-testid="inner" />}
          />
        </Theme>
      </Theme>,
    );
    expect(hasDimension(wrapperOf(glyph('outer')), '19px')).toBe(true);
    expect(hasDimension(wrapperOf(glyph('inner')), '43px')).toBe(true);
  });
});

// =============================================================================
// State appearance: one effective state, never weight
// =============================================================================

describe('effective state appearance', () => {
  it.each([
    ['rest', {}, 'outline-400'],
    ['disabled', {isDisabled: true}, 'muted-400'],
    ['loading', {isLoading: true}, 'busy-400'],
    [
      'disabled beats loading',
      {isDisabled: true, isLoading: true},
      'muted-400',
    ],
    ['aria-pressed', {'aria-pressed': true}, 'filled-400'],
  ] as const)('%s', (_name, props, expected) => {
    render(
      <Theme theme={policyTheme}>
        <Button label="Save" icon={<Icon icon="check" />} {...props} />
      </Theme>,
    );
    expect(art()).toBe(expected);
  });

  it.each([
    ['rest', {}, 'large-outline-600'],
    ['disabled', {isDisabled: true}, 'large-muted-600'],
    ['loading', {isLoading: true}, 'large-busy-600'],
  ] as const)(
    'state never changes the final-size weight (%s)',
    (_name, props, expected) => {
      render(
        <Theme theme={roleSizeTheme}>
          <Button label="Save" icon={<Icon icon="check" />} {...props} />
        </Theme>,
      );
      expect(art()).toBe(expected);
    },
  );

  it('a disabled group reports disabled for its members', () => {
    render(
      <Theme theme={policyTheme}>
        <ButtonGroup label="Actions" isDisabled>
          <Button label="Save" icon={<Icon icon="check" />} />
        </ButtonGroup>
      </Theme>,
    );
    expect(art()).toBe('muted-400');
  });

  it('explicit appearance and weight stay authoritative over state', () => {
    render(
      <Theme theme={policyTheme}>
        <Button
          label="Save"
          isDisabled
          icon={<Icon icon="check" appearance="filled" weight={600} />}
        />
      </Theme>,
    );
    expect(art()).toBe('filled-600');
  });

  it('ToggleButton changes appearance on press while box and weight stay fixed', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [isPressed, setIsPressed] = useState(false);
      return (
        <Theme theme={roleSizeTheme}>
          <ToggleButton
            label="Favorite"
            isPressed={isPressed}
            onPressedChange={setIsPressed}
            icon={<Icon icon="check" data-testid="glyph" />}
          />
        </Theme>
      );
    }
    render(<Harness />);
    const button = screen.getByRole('button', {name: 'Favorite'});
    expect(art()).toBe('large-outline-600');
    const before = wrapperOf(glyph()).getAttribute('style');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(art()).toBe('large-filled-600');
    expect(wrapperOf(glyph()).getAttribute('style')).toBe(before);
    await user.click(button);
    expect(art()).toBe('large-outline-600');
  });

  it('keeps pressedIcon as the caller source override, with the pressed appearance', () => {
    const {rerender} = render(
      <Theme theme={policyTheme}>
        <ToggleButton
          label="Star"
          isPressed={false}
          icon={<Icon icon="check" data-testid="unpressed" />}
          pressedIcon={<Icon icon="close" data-testid="pressed" />}
        />
      </Theme>,
    );
    expect(screen.getByTestId('unpressed')).toBeInTheDocument();
    expect(screen.queryByTestId('pressed')).toBeNull();
    expect(art()).toBe('outline-400');
    rerender(
      <Theme theme={policyTheme}>
        <ToggleButton
          label="Star"
          isPressed
          icon={<Icon icon="check" data-testid="unpressed" />}
          pressedIcon={<Icon icon="close" data-testid="pressed" />}
        />
      </Theme>,
    );
    expect(screen.getByTestId('pressed')).toBeInTheDocument();
    expect(screen.queryByTestId('unpressed')).toBeNull();
    expect(art()).toBe('filled-400');
  });

  it('a ToggleButtonGroup member derives pressed from group selection', () => {
    render(
      <Theme theme={policyTheme}>
        <ToggleButtonGroup
          label="Alignment"
          type="single"
          value="left"
          onChange={() => {}}>
          <ToggleButton
            label="Left"
            value="left"
            icon={<Icon icon="check" data-testid="left" />}
          />
          <ToggleButton
            label="Right"
            value="right"
            icon={<Icon icon="close" data-testid="right" />}
          />
        </ToggleButtonGroup>
      </Theme>,
    );
    expect(
      screen.getByTestId('left').querySelector('[data-art]'),
    ).toHaveAttribute('data-art', 'filled-400');
    expect(
      screen.getByTestId('right').querySelector('[data-art]'),
    ).toHaveAttribute('data-art', 'outline-400');
  });

  it('public Icon props cannot spoof the owner role, state or default size', () => {
    const spoof = {
      state: 'pressed',
      iconState: 'pressed',
      defaultSize: 'buttonRoleLarge',
      __iconState: 'pressed',
      __iconDefaultSize: 'buttonRoleLarge',
    };
    render(
      <Theme theme={policyTheme}>
        <Button
          label="Save"
          icon={<Icon icon="check" data-testid="glyph" {...spoof} />}
        />
      </Theme>,
    );
    expect(art()).toBe('outline-400');
    expect(glyph()).toHaveAttribute('data-size', 'sm');
    for (const key of Object.keys(spoof)) {
      expect(glyph()).not.toHaveAttribute(key);
    }
  });
});

// =============================================================================
// Accessibility and interaction
// =============================================================================

describe('accessibility and interaction with a participating icon', () => {
  const buttonRow = (id: string) => {
    const row = BUTTON_BINDING_STATES.find(state => state.id === id);
    if (!row) {
      throw new Error(`Missing button pattern row ${id}`);
    }
    return row;
  };
  const participatingButton: Record<
    string,
    (activate: () => void) => React.ReactNode
  > = {
    'button-text': activate => (
      <Button
        label="Save changes"
        icon={<Icon icon="check" />}
        onClick={activate}
      />
    ),
    'button-icon-only': activate => (
      <Button
        label="Delete conversation"
        isIconOnly
        icon={<Icon icon="close" />}
        onClick={activate}
      />
    ),
    'button-disabled': activate => (
      <Button
        label="Save changes"
        isDisabled
        icon={<Icon icon="check" />}
        onClick={activate}
      />
    ),
    'button-loading': activate => (
      <Button
        label="Save changes"
        isLoading
        icon={<Icon icon="check" />}
        onClick={activate}
      />
    ),
    'icon-button': activate => (
      <IconButton
        label="Delete conversation"
        icon={<Icon icon="close" />}
        onClick={activate}
      />
    ),
    'icon-button-disabled': activate => (
      <IconButton
        label="Delete conversation"
        icon={<Icon icon="close" />}
        isDisabled
        onClick={activate}
      />
    ),
    'icon-button-loading': activate => (
      <IconButton
        label="Delete conversation"
        icon={<Icon icon="close" />}
        isLoading
        onClick={activate}
      />
    ),
  };

  it.each(Object.keys(participatingButton))(
    'the shared button pattern holds for %s under a role theme',
    async id => {
      const row = buttonRow(id);
      let activations = 0;
      await expectAccessibilitySpec({
        spec: BUTTON_PATTERN,
        binding: row.binding,
        state: row.id,
        facts: row.facts,
        knownFailures: BUTTON_KNOWN_FAILURES,
        render: () => {
          activations = 0;
          render(
            <Theme theme={roleSizeTheme}>
              {participatingButton[id](() => {
                activations += 1;
              })}
            </Theme>,
          );
        },
        subject: () => screen.getByRole('button', {hidden: true}),
        cleanup,
        activations: async () => activations,
      });
    },
  );

  const participatingToggle: Record<string, () => React.ReactNode> = {
    'standalone-pressed': () => (
      <ToggleButton label="Bold" isPressed icon={<Icon icon="check" />} />
    ),
    'icon-only-unpressed': () => (
      <ToggleButton
        label="Bold"
        isIconOnly
        isPressed={false}
        icon={<Icon icon="check" />}
      />
    ),
    'disabled-unpressed': () => (
      <ToggleButton
        label="Bold"
        isDisabled
        isPressed={false}
        icon={<Icon icon="check" />}
      />
    ),
  };

  it.each(Object.keys(participatingToggle))(
    'the toggle-button pattern holds for %s under a role theme',
    async id => {
      const row = TOGGLE_BUTTON_BINDING_STATES.find(state => state.id === id);
      if (!row || !('facts' in row)) {
        throw new Error(`Missing toggle pattern row ${id}`);
      }
      await expectAccessibilitySpec({
        spec: TOGGLE_BUTTON_PATTERN,
        binding: 'ToggleButton',
        state: row.id,
        facts: row.facts,
        render: () => {
          render(
            <Theme theme={roleSizeTheme}>{participatingToggle[id]()}</Theme>,
          );
        },
        subject: () => screen.getByRole('button', {hidden: true}),
        cleanup,
      });
    },
  );

  it('keeps the glyph decorative and the label as the only accessible name', () => {
    render(
      <Theme theme={roleSizeTheme}>
        <IconButton
          label="Add item"
          icon={<Icon icon="check" data-testid="glyph" />}
        />
      </Theme>,
    );
    const button = screen.getByRole('button', {name: 'Add item'});
    expect(button).toHaveAttribute('aria-label', 'Add item');
    expect(glyph()).toHaveAttribute('aria-hidden', 'true');
    expect(glyph()).not.toHaveAttribute('role');
  });

  it('forwards Icon label, ref, className, style and data attributes unchanged', () => {
    const ref = createRef<SVGSVGElement>();
    function Glyph(props: SVGProps<SVGSVGElement>) {
      return <svg {...props} data-testid="direct" />;
    }
    render(
      <Theme theme={roleSizeTheme}>
        <Button
          label="Save"
          icon={
            <Icon
              icon={Glyph}
              ref={ref}
              label="Saved state"
              className="caller-class"
              style={{opacity: 0.5}}
              data-caller="kept"
            />
          }
        />
      </Theme>,
    );
    const direct = screen.getByTestId('direct');
    expect(direct).toHaveAttribute('role', 'img');
    expect(direct).toHaveAttribute('aria-label', 'Saved state');
    expect(direct).toHaveAttribute('data-caller', 'kept');
    expect(direct.getAttribute('class')).toContain('caller-class');
    expect(direct.style.opacity).toBe('0.5');
    expect(ref.current).toBe(direct);
    expect(hasDimension(direct, '43px')).toBe(true);
    expect(hasDimension(wrapperOf(direct), '43px')).toBe(true);
  });

  it('activates from the keyboard and blocks a disabled control', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onDisabled = vi.fn();
    render(
      <Theme theme={roleSizeTheme}>
        <Button label="Save" icon={<Icon icon="check" />} onClick={onClick} />
        <Button
          label="Off"
          isDisabled
          icon={<Icon icon="check" />}
          onClick={onDisabled}
        />
      </Theme>,
    );
    await user.tab();
    expect(screen.getByRole('button', {name: 'Save'})).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', {name: 'Off'}));
    expect(onDisabled).not.toHaveBeenCalled();
  });

  it('keeps loading semantics: busy, hidden content and a stable box', () => {
    const tree = (isLoading: boolean) => (
      <Theme theme={roleSizeTheme}>
        <Button
          label="Save"
          isLoading={isLoading}
          icon={<Icon icon="check" data-testid="glyph" />}
        />
      </Theme>
    );
    const {rerender} = render(tree(false));
    const before = wrapperOf(glyph()).outerHTML.replace(/data-art="[^"]+"/, '');
    rerender(tree(true));
    const button = screen.getByRole('button', {name: 'Save'});
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(wrapperOf(wrapperOf(glyph()))).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(wrapperOf(glyph()).outerHTML.replace(/data-art="[^"]+"/, '')).toBe(
      before,
    );
  });

  it('server-renders the shared box and hydrates without mismatch', async () => {
    const tree = (
      <Theme theme={roleSizeTheme}>
        <Button label="Save" icon={<Icon icon="check" data-testid="glyph" />} />
      </Theme>
    );
    const host = document.createElement('div');
    host.innerHTML = renderToString(tree);
    document.body.append(host);
    const serverGlyph = host.querySelector('[data-testid="glyph"]')!;
    expect(hasDimension(serverGlyph, '43px')).toBe(true);
    expect(hasDimension(serverGlyph.parentElement!, '43px')).toBe(true);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(host, tree, {onRecoverableError: recoverable});
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(host.querySelector('[data-testid="glyph"]')).toBe(serverGlyph);
    await act(async () => {
      root?.unmount();
    });
    host.remove();
  });
});
