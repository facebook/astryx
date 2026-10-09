// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonIconRole.stories.tsx
 * @input Button, IconButton, ToggleButton and ButtonGroup with supplied adaptive artwork
 * @output Browser evidence for the `button-leading` role: default pixels, theme
 *   role size, shared wrapper/glyph boxes, root-font scaling and state appearance
 * @position Story hooks for real-browser geometry; jsdom evidence lives in
 *   packages/core/src/Button/buttonIconRole.test.tsx
 *
 * Every case is a `[data-button-role-case]` row. Inside it, `.astryx-icon` is
 * the glyph, its parent element is the Button-owned wrapper, and the closest
 * `button` is the control. Each row also renders a live box readout so a
 * screenshot carries the measured numbers. The play functions assert the same
 * boxes; screenshots and release approval are separate evidence.
 */

import type {Meta, StoryObj} from '@storybook/react';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Icon,
  defineAdaptiveIcon,
  defineIconCapabilities,
} from '@astryxdesign/core/Icon';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

// =============================================================================
// Supplied artwork: four appearances, two weights, one custom size branch
// =============================================================================

const capabilities = defineIconCapabilities({
  sizes: {buttonStoryLarge: {default: '1.75rem'}},
  appearances: ['outline', 'filled', 'muted', 'busy'],
  weights: {values: [400, 600]},
});

declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    buttonIconRoleStory: typeof capabilities;
  }
}

type Appearance = 'outline' | 'filled' | 'muted' | 'busy';

function Art({
  appearance,
  weight,
  branch,
}: {
  appearance: Appearance;
  weight: 400 | 600;
  branch: 'default' | 'large';
}) {
  const stroke = weight === 600 ? 3 : 1.5;
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      data-artwork={appearance}
      data-weight={weight}
      data-branch={branch}>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill={appearance === 'filled' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={
          appearance === 'muted'
            ? '2 3'
            : appearance === 'busy'
              ? '6 3'
              : undefined
        }
        opacity={appearance === 'muted' ? 0.6 : 1}
      />
      {branch === 'large' ? (
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      ) : null}
    </svg>
  );
}

const weights = (appearance: Appearance, branch: 'default' | 'large') => ({
  default: <Art appearance={appearance} weight={400} branch={branch} />,
  byWeight: {
    400: <Art appearance={appearance} weight={400} branch={branch} />,
    600: <Art appearance={appearance} weight={600} branch={branch} />,
  },
});
const appearances = (branch: 'default' | 'large') => ({
  default: weights('outline', branch),
  byAppearance: {
    outline: weights('outline', branch),
    filled: weights('filled', branch),
    muted: weights('muted', branch),
    busy: weights('busy', branch),
  },
});
const adaptive = defineAdaptiveIcon(capabilities, {
  default: appearances('default'),
  bySize: {buttonStoryLarge: appearances('large')},
});
const sparse = defineAdaptiveIcon(capabilities, {
  default: <Art appearance="outline" weight={400} branch="default" />,
});

// =============================================================================
// Themes
// =============================================================================

const plain = defineTheme({
  name: 'button-role-story-plain',
  icons: {check: adaptive, search: sparse},
});
const policy = defineTheme({
  name: 'button-role-story-policy',
  icons: {check: adaptive, search: sparse},
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {sm: '18px', md: '22px'},
    presentation: {
      default: {appearance: 'outline', weight: 400},
      bySize: {buttonStoryLarge: {weight: 600}},
      byState: {
        disabled: {appearance: 'muted'},
        pressed: {appearance: 'filled'},
        loading: {appearance: 'busy'},
      },
    },
  },
});
const role = defineTheme({
  name: 'button-role-story-role-size',
  extends: policy,
  iconCapabilities: {roleSizeOverrides: {'button-leading': 'buttonStoryLarge'}},
});
const cleared = defineTheme({
  name: 'button-role-story-cleared',
  extends: role,
  iconCapabilities: {roleSizeOverrides: {'button-leading': null}},
});

// =============================================================================
// Evidence hooks
// =============================================================================

const styles = stylex.create({
  column: {display: 'flex', flexDirection: 'column', gap: 12, padding: 24},
  row: {display: 'flex', alignItems: 'center', gap: 16, minHeight: 48},
  id: {width: 220, fontFamily: 'monospace', fontSize: 12},
  readout: {fontFamily: 'monospace', fontSize: 12, opacity: 0.8},
  heading: {fontWeight: 600, marginTop: 8},
});

interface Boxes {
  control: DOMRect;
  wrapper: DOMRect;
  glyph: DOMRect;
  artwork: Element | null;
}

function measure(row: Element): Boxes {
  const glyph = row.querySelector('.astryx-icon');
  const wrapper = glyph?.parentElement;
  const control = row.querySelector('button');
  if (!glyph || !wrapper || !control) {
    throw new Error(
      `Missing Button icon evidence hook in ${row.getAttribute('data-button-role-case')}`,
    );
  }
  return {
    control: control.getBoundingClientRect(),
    wrapper: wrapper.getBoundingClientRect(),
    glyph: glyph.getBoundingClientRect(),
    artwork: row.querySelector('[data-artwork]'),
  };
}

const px = (value: number) => Math.round(value * 100) / 100;

function Case({id, children}: {id: string; children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState('');
  useLayoutEffect(() => {
    const row = ref.current;
    if (!row) {
      return;
    }
    const update = () => {
      try {
        const {control, wrapper, glyph, artwork} = measure(row);
        setReadout(
          `control ${px(control.width)}×${px(control.height)} · wrapper ${px(wrapper.width)}×${px(wrapper.height)} · glyph ${px(glyph.width)}×${px(glyph.height)}` +
            (artwork
              ? ` · ${artwork.getAttribute('data-artwork')}/${artwork.getAttribute('data-weight')}/${artwork.getAttribute('data-branch')}`
              : ''),
        );
      } catch {
        setReadout('no icon');
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    const mutations = new MutationObserver(update);
    mutations.observe(row, {subtree: true, attributes: true, childList: true});
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
  return (
    <div ref={ref} {...stylex.props(styles.row)} data-button-role-case={id}>
      <span {...stylex.props(styles.id)}>{id}</span>
      {children}
      <output {...stylex.props(styles.readout)} data-button-role-readout={id}>
        {readout}
      </output>
    </div>
  );
}

function row(canvas: HTMLElement, id: string): Element {
  const found = canvas.querySelector(`[data-button-role-case="${id}"]`);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function near(actual: number, expected: number, label: string): void {
  if (Math.abs(actual - expected) > 0.5) {
    throw new Error(`${label}: expected ${expected}px, got ${actual}px`);
  }
}

/** Wrapper and glyph paint one square box of `expected` px. */
function assertShared(
  canvas: HTMLElement,
  id: string,
  expected: number,
): Boxes {
  const boxes = measure(row(canvas, id));
  for (const [name, rect] of [
    ['wrapper', boxes.wrapper],
    ['glyph', boxes.glyph],
  ] as const) {
    near(rect.width, expected, `${id} ${name} width`);
    near(rect.height, expected, `${id} ${name} height`);
  }
  return boxes;
}

function rootPx(canvas: HTMLElement): number {
  return parseFloat(
    getComputedStyle(canvas.ownerDocument.documentElement).fontSize,
  );
}

const icon = (name: 'check' | 'search' = 'check') => <Icon icon={name} />;
/** A Fragment is not a direct Icon, so Button renders its released markup. */
const releasedIcon = (name: 'check' | 'search' = 'check'): ReactElement => (
  <>{icon(name)}</>
);

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/Button/Icon Role',
  parameters: {
    docs: {
      description: {
        component:
          'The Button family has one owned icon role, `button-leading`. A direct Icon in Button, IconButton or ToggleButton resolves one final size and theme dimension that the Button wrapper and the glyph share, and reports one state (disabled, pressed or loading) that only changes appearance. Without theme icon policy the markup and pixels match the released Button.',
      },
    },
  },
};
export default meta;

const sizes = ['sm', 'md', 'lg'] as const;

export const DefaultPixels: StoryObj = {
  render: () => (
    <Theme theme={plain}>
      <div {...stylex.props(styles.column)}>
        {sizes.map(size => (
          <div key={size}>
            <Case id={`before-${size}`}>
              <Button label="Released" size={size} icon={releasedIcon()} />
            </Case>
            <Case id={`after-${size}`}>
              <Button label="Released" size={size} icon={icon()} />
            </Case>
            <Case id={`before-icon-only-${size}`}>
              <IconButton label="Star" size={size} icon={releasedIcon()} />
            </Case>
            <Case id={`after-icon-only-${size}`}>
              <IconButton label="Star" size={size} icon={icon()} />
            </Case>
          </div>
        ))}
      </div>
    </Theme>
  ),
  play: ({canvasElement}) => {
    const root = rootPx(canvasElement);
    for (const size of sizes) {
      const expected = size === 'lg' ? root * 1.25 : root;
      for (const kind of ['', 'icon-only-']) {
        const before = assertShared(
          canvasElement,
          `before-${kind}${size}`,
          expected,
        );
        const after = assertShared(
          canvasElement,
          `after-${kind}${size}`,
          expected,
        );
        near(
          after.control.width,
          before.control.width,
          `${kind}${size} control width`,
        );
        near(
          after.control.height,
          before.control.height,
          `${kind}${size} control height`,
        );
        near(
          after.glyph.left - after.control.left,
          before.glyph.left - before.control.left,
          `${kind}${size} glyph offset`,
        );
        if (kind) {
          near(
            after.control.width,
            after.control.height,
            `${size} icon-only square`,
          );
        }
      }
    }
  },
};

export const RoleSize: StoryObj = {
  render: () => (
    <div {...stylex.props(styles.column)}>
      <span {...stylex.props(styles.heading)}>No icon policy (before)</span>
      <Theme theme={plain}>
        {sizes.map(size => (
          <Case key={size} id={`plain-${size}`}>
            <Button label="Save" size={size} icon={icon()} />
          </Case>
        ))}
      </Theme>
      <span {...stylex.props(styles.heading)}>
        Theme dimensions sm 18px / md 22px
      </span>
      <Theme theme={policy}>
        {sizes.map(size => (
          <Case key={size} id={`policy-${size}`}>
            <Button label="Save" size={size} icon={icon()} />
          </Case>
        ))}
      </Theme>
      <span {...stylex.props(styles.heading)}>
        Role size buttonStoryLarge (1.75rem default)
      </span>
      <Theme theme={role}>
        {sizes.map(size => (
          <Case key={size} id={`role-${size}`}>
            <Button label="Save" size={size} icon={icon()} />
          </Case>
        ))}
        <Case id="role-icon-only">
          <IconButton label="Star" icon={icon()} />
        </Case>
        <Case id="role-toggle">
          <ToggleButton label="Star" isPressed={false} icon={icon()} />
        </Case>
        <Case id="role-explicit-md">
          <Button label="Explicit" icon={<Icon icon="check" size="md" />} />
        </Case>
        <Case id="role-sparse">
          <Button label="Sparse artwork" icon={icon('search')} />
        </Case>
        <Case id="role-nonparticipating">
          <Button label="Nested Icon" icon={<span>{icon()}</span>} />
        </Case>
      </Theme>
      <span {...stylex.props(styles.heading)}>Role size cleared with null</span>
      <Theme theme={cleared}>
        <Case id="cleared-lg">
          <Button label="Save" size="lg" icon={icon()} />
        </Case>
      </Theme>
    </div>
  ),
  play: ({canvasElement}) => {
    const root = rootPx(canvasElement);
    const large = root * 1.75;
    for (const size of sizes) {
      const plainBoxes = assertShared(
        canvasElement,
        `plain-${size}`,
        size === 'lg' ? root * 1.25 : root,
      );
      const policyBoxes = assertShared(
        canvasElement,
        `policy-${size}`,
        size === 'lg' ? 22 : 18,
      );
      const roleBoxes = assertShared(canvasElement, `role-${size}`, large);
      // The control height is the family contract; only the icon box moves.
      near(
        policyBoxes.control.height,
        plainBoxes.control.height,
        `${size} height`,
      );
      near(
        roleBoxes.control.height,
        plainBoxes.control.height,
        `${size} height`,
      );
      if (roleBoxes.artwork?.getAttribute('data-branch') !== 'large') {
        throw new Error(`${size}: role size did not select the large branch`);
      }
      if (roleBoxes.artwork?.getAttribute('data-weight') !== '600') {
        throw new Error(`${size}: final size did not select bySize weight`);
      }
    }
    const iconOnly = assertShared(canvasElement, 'role-icon-only', large);
    near(iconOnly.control.width, iconOnly.control.height, 'icon-only square');
    assertShared(canvasElement, 'role-toggle', large);
    assertShared(canvasElement, 'role-explicit-md', 22);
    const sparseBoxes = assertShared(canvasElement, 'role-sparse', large);
    if (sparseBoxes.artwork?.getAttribute('data-branch') !== 'default') {
      throw new Error('Sparse artwork should fall back inside the final box');
    }
    const nested = measure(row(canvasElement, 'role-nonparticipating'));
    near(nested.wrapper.width, root, 'nonparticipating wrapper');
    near(nested.glyph.width, root, 'nonparticipating glyph');
    assertShared(canvasElement, 'cleared-lg', 22);
  },
};

function StateRows() {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <div {...stylex.props(styles.column)}>
      <Case id="state-rest">
        <Button label="Rest" icon={icon()} />
      </Case>
      <Case id="state-disabled">
        <Button label="Disabled" isDisabled icon={icon()} />
      </Case>
      <Case id="state-loading">
        <Button label="Loading" isLoading icon={icon()} />
      </Case>
      <Case id="state-group-disabled">
        <ButtonGroup label="Group" isDisabled>
          <Button label="Group disabled" icon={icon()} />
        </ButtonGroup>
      </Case>
      <Case id="state-pressed-disabled">
        <ToggleButton
          label="Pressed and disabled"
          isPressed
          isDisabled
          icon={icon()}
        />
      </Case>
      <Case id="state-pressed-source-override">
        <ToggleButton
          label="pressedIcon override"
          isPressed
          icon={icon('search')}
          pressedIcon={icon()}
        />
      </Case>
      <Case id="state-toggle">
        <ToggleButton
          label="Toggle me"
          isPressed={isPressed}
          onPressedChange={setIsPressed}
          icon={icon()}
          data-button-role-toggle
        />
      </Case>
    </div>
  );
}

function artwork(canvas: HTMLElement, id: string): string {
  const art = measure(row(canvas, id)).artwork;
  return `${art?.getAttribute('data-artwork')}/${art?.getAttribute('data-weight')}`;
}

export const StateAppearance: StoryObj = {
  render: () => (
    <Theme theme={role}>
      <StateRows />
    </Theme>
  ),
  play: async ({canvasElement}) => {
    const expected: Record<string, string> = {
      'state-rest': 'outline/600',
      'state-disabled': 'muted/600',
      'state-loading': 'busy/600',
      'state-group-disabled': 'muted/600',
      'state-pressed-disabled': 'muted/600',
      'state-pressed-source-override': 'filled/600',
    };
    for (const [id, value] of Object.entries(expected)) {
      if (artwork(canvasElement, id) !== value) {
        throw new Error(
          `${id}: expected ${value}, got ${artwork(canvasElement, id)}`,
        );
      }
    }
    const toggle = canvasElement.querySelector<HTMLButtonElement>(
      '[data-button-role-toggle]',
    );
    if (!toggle) {
      throw new Error('Missing toggle hook');
    }
    const before = measure(row(canvasElement, 'state-toggle'));
    toggle.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (toggle.getAttribute('aria-pressed') !== 'true') {
      throw new Error('Toggle did not press');
    }
    if (artwork(canvasElement, 'state-toggle') !== 'filled/600') {
      throw new Error('Pressed state should change appearance only');
    }
    const after = measure(row(canvasElement, 'state-toggle'));
    for (const key of ['control', 'wrapper', 'glyph'] as const) {
      near(after[key].width, before[key].width, `pressed ${key} width`);
      near(after[key].height, before[key].height, `pressed ${key} height`);
    }
    toggle.focus();
    if (canvasElement.ownerDocument.activeElement !== toggle) {
      throw new Error('Toggle is not focusable');
    }
  },
};

function Switching() {
  const [isRole, setIsRole] = useState(false);
  return (
    <div {...stylex.props(styles.column)}>
      <button
        type="button"
        data-button-role-switch
        onClick={() => {
          setIsRole(value => !value);
        }}>
        Switch theme
      </button>
      <Theme theme={isRole ? role : policy}>
        <Case id="switching">
          <Button label="Save" icon={icon()} />
        </Case>
        <Theme theme={isRole ? policy : role}>
          <Case id="switching-nested">
            <Button label="Nested theme" icon={icon()} />
          </Case>
        </Theme>
      </Theme>
      <output data-button-role-active>{isRole ? 'role' : 'policy'}</output>
    </div>
  );
}

export const ThemeSwitching: StoryObj = {
  render: () => <Switching />,
  play: async ({canvasElement}) => {
    const root = rootPx(canvasElement);
    assertShared(canvasElement, 'switching', 18);
    assertShared(canvasElement, 'switching-nested', root * 1.75);
    canvasElement
      .querySelector<HTMLButtonElement>('[data-button-role-switch]')
      ?.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    assertShared(canvasElement, 'switching', root * 1.75);
    assertShared(canvasElement, 'switching-nested', 18);
  },
};

function RootFontRows() {
  const [rootFont, setRootFont] = useState<string | null>(null);
  useLayoutEffect(() => {
    const element = document.documentElement;
    const previous = element.style.fontSize;
    if (rootFont !== null) {
      element.style.fontSize = rootFont;
    }
    return () => {
      element.style.fontSize = previous;
    };
  }, [rootFont]);
  return (
    <div {...stylex.props(styles.column)}>
      <button
        type="button"
        data-button-role-root-font
        onClick={() => {
          setRootFont(value => (value === null ? '20px' : null));
        }}>
        Toggle 20px root font
      </button>
      <Theme theme={plain}>
        <Case id="root-rem-default">
          <Button label="Canonical rem" icon={icon()} />
        </Case>
      </Theme>
      <Theme theme={policy}>
        <Case id="root-px-override">
          <Button label="Theme px" icon={icon()} />
        </Case>
      </Theme>
      <Theme theme={role}>
        <Case id="root-rem-role">
          <Button label="Role rem" icon={icon()} />
        </Case>
      </Theme>
    </div>
  );
}

export const RootFontScaling: StoryObj = {
  render: () => <RootFontRows />,
  play: async ({canvasElement}) => {
    const check = () => {
      const root = rootPx(canvasElement);
      assertShared(canvasElement, 'root-rem-default', root);
      assertShared(canvasElement, 'root-px-override', 18);
      assertShared(canvasElement, 'root-rem-role', root * 1.75);
    };
    check();
    const toggle = canvasElement.querySelector<HTMLButtonElement>(
      '[data-button-role-root-font]',
    );
    toggle?.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    check();
    toggle?.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
  },
};
