// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

const meta: Meta<typeof Spinner> = {
  title: 'Core/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Spinner size',
    },
    shade: {
      control: 'select',
      options: ['default', 'onMedia', 'subtle', 'inherit'],
      description: 'Color shade',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
    shade: 'default',
  },
};

export const Sizes: Story = {
  render: () => (
    <HStack gap={4} vAlign="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
  ),
};

export const Shades: Story = {
  render: () => (
    <HStack gap={4} vAlign="center">
      <Spinner shade="default" />
      <div
        style={{
          backgroundColor: '#1a1a2e',
          padding: 16,
          borderRadius: 8,
        }}>
        <Spinner shade="onMedia" />
      </div>
    </HStack>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <HStack gap={8} vAlign="start">
      <Spinner size="lg" label="Loading..." />
      <Spinner
        size="lg"
        label={
          <VStack gap={0} hAlign="center">
            <Text type="body" weight="bold">
              Fetching data
            </Text>
            <Text type="supporting" color="secondary">
              This may take a moment
            </Text>
          </VStack>
        }
        aria-label="Fetching data"
      />
    </HStack>
  ),
};

// The ring is an SVG circle whose radius and stroke come off the cascade, so a
// theme reaches its geometry and its two colors through public custom
// properties rather than CSS box properties — `width` would name a box the
// ring is not. These stories are how that surface is checked: the a11y and RTL
// audits only see what a story renders, and a themed ring cannot be verified
// in jsdom (no layout, no registered properties), so this is where a browser
// can look at it.
//
// Geometry is deliberately themed in `rem` rather than `px`: the resolved vars
// are registered as `<length>`, and a relative unit surviving into the drawn
// radius is what distinguishes a resolved value from substituted text.
const themedGeometry = defineTheme({
  name: 'spinner-themed-geometry',
  components: {
    spinner: {
      'size:sm': {
        '--spinner-diameter': '1rem',
        '--spinner-rail-width': '0.125rem',
      },
      'size:md': {
        '--spinner-diameter': '1.5rem',
        '--spinner-rail-width': '0.25rem',
      },
      'size:lg': {
        '--spinner-diameter': '2rem',
        '--spinner-rail-width': '0.3125rem',
      },
      'size:xl': {
        '--spinner-diameter': 'calc(2rem + 8px)',
        '--spinner-rail-width': '0.375rem',
      },
    },
  },
});

export const ThemedGeometry: Story = {
  name: 'Themed Geometry (per size)',
  render: () => (
    <VStack gap={6}>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Default — 10 / 14 / 18 / 28px rings
        </Text>
        <HStack gap={4} vAlign="center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </HStack>
      </VStack>

      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Themed — rem and calc() diameters; the box tracks the ring
        </Text>
        <Theme theme={themedGeometry} mode="light">
          <HStack gap={4} vAlign="center">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </HStack>
        </Theme>
      </VStack>
    </VStack>
  ),
};

// A rail of `0` is a legitimate thing to theme — an arc with no visible track —
// and is the case that used to read as "unset" and silently draw the default
// ring in a box sized for none.
const themedRailless = defineTheme({
  name: 'spinner-themed-railless',
  components: {
    spinner: {
      'size:xl': {'--spinner-rail-width': '0px'},
      base: {'--spinner-track-color': 'transparent'},
    },
  },
});

// Colors default to each shade's token, so a theme can retune one shade
// without touching the others. `--color-text-blue` over a muted wash reads as
// themed in the monochrome neutral theme, where an accent-muted pair would
// land within a shade of the default.
const themedColor = defineTheme({
  name: 'spinner-themed-color',
  components: {
    spinner: {
      base: {
        '--spinner-color': 'var(--color-text-blue)',
        '--spinner-track-color': 'var(--color-background-blue)',
      },
      'shade:subtle': {'--spinner-track-color': 'transparent'},
    },
  },
});

export const ThemedColor: Story = {
  name: 'Themed Color (per shade)',
  render: () => (
    <VStack gap={6}>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Default — accent arc over the track token
        </Text>
        <HStack gap={4} vAlign="center">
          <Spinner size="xl" />
          <Spinner size="xl" shade="subtle" />
        </HStack>
      </VStack>

      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Themed — blue arc and wash; the subtle shade drops its track
        </Text>
        <Theme theme={themedColor} mode="light">
          <HStack gap={4} vAlign="center">
            <Spinner size="xl" />
            <Spinner size="xl" shade="subtle" />
          </HStack>
        </Theme>
      </VStack>

      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Themed — a rail of 0: an arc with no track, in a box that fits it
        </Text>
        <Theme theme={themedRailless} mode="light">
          <Spinner size="xl" />
        </Theme>
      </VStack>
    </VStack>
  ),
};
