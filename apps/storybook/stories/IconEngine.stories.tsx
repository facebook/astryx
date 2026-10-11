// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconEngine.stories.tsx
 * @input Bound supplied artwork and default/per-size theme dimensions
 * @output Browser-ready geometry, nested-theme and fractional-weight examples
 * @position A-only Icon evidence hooks; existing Button stays nonparticipating
 */

import type {Meta, StoryObj} from '@storybook/react';
import {useState, type ReactNode, type SVGProps} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Icon,
  defineIconCapabilities,
  defineAdaptiveIcon,
} from '@astryxdesign/core/Icon';
import {Button} from '@astryxdesign/core/Button';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

const capabilities = defineIconCapabilities({
  sizes: {engineStoryCompact: {default: '14px'}},
  appearances: ['outline', 'filled'],
  weights: {range: {min: 100, max: 900}},
});

declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    iconEngineStory: typeof capabilities;
  }
}

function Outline({weight = 300}: {weight?: number}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      data-artwork="outline"
      data-weight={weight}>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth={weight / 200}
      />
    </svg>
  );
}

function Filled({weight = 300}: {weight?: number}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      data-artwork="filled"
      data-weight={weight}>
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={weight / 200}
      />
    </svg>
  );
}

function Ordinary(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" data-artwork="ordinary">
      <path d="M4 12h16M12 4v16" stroke="currentColor" />
    </svg>
  );
}

const source = defineAdaptiveIcon(capabilities, {
  default: {render: Outline, weightRange: {min: 100, max: 900}},
  byAppearance: {filled: {render: Filled, weightRange: {min: 100, max: 900}}},
});
const base = defineTheme({
  name: 'icon-engine-story',
  icons: {search: source},
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {sm: '24px', md: '28px', engineStoryCompact: '18px'},
    presentation: {
      default: {appearance: 'outline', weight: 300},
      bySize: {sm: {appearance: 'filled', weight: 500}},
    },
  },
});
const nested = defineTheme({
  name: 'icon-engine-story-nested',
  extends: base,
  iconCapabilities: {
    sizeOverrides: {md: '36px'},
    presentation: {default: {appearance: 'filled', weight: 700}},
  },
});
const cleared = defineTheme({
  name: 'icon-engine-story-cleared',
  extends: base,
  iconCapabilities: {sizeOverrides: {md: null}},
});
const plain = defineTheme({name: 'icon-engine-story-no-policy'});
const styles = stylex.create({
  column: {display: 'flex', flexDirection: 'column', gap: 16, padding: 24},
  row: {display: 'flex', alignItems: 'center', gap: 16},
});

function Case({id, children}: {id: string; children: ReactNode}) {
  return (
    <div {...stylex.props(styles.row)} data-icon-engine-case={id}>
      <span>{id}</span>
      {children}
    </div>
  );
}

function Geometry() {
  return (
    <Theme theme={base}>
      <div {...stylex.props(styles.column)}>
        <Case id="standalone-md">
          <Icon icon="search" />
        </Case>
        <Case id="explicit-sm">
          <Icon icon="search" size="sm" />
        </Case>
        <Case id="custom-size">
          <Icon icon="search" size="engineStoryCompact" />
        </Case>
        <Case id="fractional">
          <Icon
            icon="search"
            appearance="filled"
            weight={450.5}
            label="Filled fractional-weight artwork"
          />
        </Case>
        <Case id="ordinary">
          <Icon
            icon={Ordinary}
            size="md"
            role="status"
            aria-label="Ordinary direct icon"
            aria-hidden={false}
          />
        </Case>
        <Case id="legacy-implicit">
          <Button
            label="Implicit existing component"
            size="sm"
            icon={<Icon icon="search" />}
          />
        </Case>
        <Case id="legacy-explicit">
          <Button
            label="Explicit existing component"
            size="sm"
            icon={<Icon icon="search" size="md" />}
          />
        </Case>
        <Theme theme={nested}>
          <Case id="nested-md">
            <Icon icon="search" />
          </Case>
        </Theme>
      </div>
    </Theme>
  );
}

function Switching() {
  const [large, setLarge] = useState(false);
  return (
    <div {...stylex.props(styles.column)}>
      <button
        type="button"
        data-icon-engine-switch
        onClick={() => {
          setLarge(value => !value);
        }}>
        Switch active theme
      </button>
      <Theme theme={large ? nested : base}>
        <Case id="switching-md">
          <Icon icon="search" />
        </Case>
      </Theme>
      <output data-icon-engine-active>{large ? 'nested' : 'base'}</output>
    </div>
  );
}

function box(canvas: HTMLElement, id: string): Element {
  const result = canvas.querySelector(
    `[data-icon-engine-case="${id}"] .astryx-icon`,
  );
  if (!result) {
    throw new Error(`Missing Icon evidence hook: ${id}`);
  }
  return result;
}

function assertBox(canvas: HTMLElement, id: string, expected: number): void {
  const target = box(canvas, id);
  const rect = target.getBoundingClientRect();
  if (
    Math.abs(rect.width - expected) > 0.5 ||
    Math.abs(rect.height - expected) > 0.5
  ) {
    throw new Error(
      `${id}: expected ${expected}px square, got ${rect.width} × ${rect.height}`,
    );
  }
  const glyph = target.matches('svg') ? target : target.querySelector('svg');
  if (
    !glyph ||
    Math.abs(glyph.getBoundingClientRect().width - expected) > 0.5
  ) {
    throw new Error(`${id}: supplied glyph and Icon box differ`);
  }
}

const meta: Meta = {
  title: 'Core/Icon/Capability Engine',
  parameters: {
    docs: {
      description: {
        component:
          'Supplied outline/filled artwork, fractional weights and non-CSS dimensions. Existing Button is a legacy compatibility control, not a participating consumer. The play hooks check actual browser boxes; screenshots and release approval are separate evidence.',
      },
    },
  },
};
export default meta;

export const GeometryAndArtwork: StoryObj = {
  render: () => <Geometry />,
  play: ({canvasElement}) => {
    const root = parseFloat(
      getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize,
    );
    for (const [id, expected] of [
      ['standalone-md', 28],
      ['explicit-sm', 24],
      ['custom-size', 18],
      ['fractional', 28],
      ['ordinary', 28],
      ['legacy-explicit', 28],
      ['nested-md', 36],
    ] as const) {
      assertBox(canvasElement, id, expected);
    }
    assertBox(canvasElement, 'legacy-implicit', root);
    const fractional = box(canvasElement, 'fractional');
    if (
      fractional.querySelector(
        '[data-weight="450.5"][data-artwork="filled"]',
      ) === null ||
      fractional.getAttribute('aria-label') !==
        'Filled fractional-weight artwork'
    ) {
      throw new Error('Fractional artwork or accessible name changed');
    }
    const ordinary = box(canvasElement, 'ordinary');
    if (
      ordinary.hasAttribute('appearance') ||
      ordinary.hasAttribute('weight') ||
      ordinary.getAttribute('role') !== 'status' ||
      ordinary.getAttribute('aria-hidden') !== 'false'
    ) {
      throw new Error('Ordinary SVG props or native ARIA changed');
    }
  },
};

export const ThemeSwitching: StoryObj = {render: () => <Switching />};

export const OmittedAndClearedCompatibility: StoryObj = {
  render: () => (
    <div {...stylex.props(styles.column)}>
      <Theme theme={plain}>
        <Case id="omitted-md">
          <Icon icon="search" />
        </Case>
      </Theme>
      <Theme theme={cleared}>
        <Case id="cleared-md">
          <Icon icon="search" />
        </Case>
      </Theme>
    </div>
  ),
  play: ({canvasElement}) => {
    const root = parseFloat(
      getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize,
    );
    assertBox(canvasElement, 'omitted-md', root * 1.25);
    assertBox(canvasElement, 'cleared-md', root * 1.25);
  },
};
