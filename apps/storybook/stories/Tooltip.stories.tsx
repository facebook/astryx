// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Tooltip, useTooltip} from '@astryxdesign/core/Tooltip';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/Layout';
import {Stack} from '@astryxdesign/core/Stack';
import {Toast} from '@astryxdesign/core/Toast';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';

const meta: Meta<typeof Tooltip> = {
  title: 'Core/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description: 'Position relative to trigger',
    },
    alignment: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment on placement axis',
    },
    delay: {
      control: 'number',
      description: 'Show delay in ms',
    },
    hideDelay: {
      control: 'number',
      description: 'Hide delay in ms',
    },
    isEnabled: {
      control: 'boolean',
      description: 'Enable/disable the tooltip',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const Below: Story = {
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const Start: Story = {
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const End: Story = {
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const CustomDelay: Story = {
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <Button label="Slow tooltip">Slow tooltip</Button>,
  },
};

export const Disabled: Story = {
  name: 'Disabled Tooltip',
  args: {
    placement: 'above',
    isEnabled: false,
    content: 'You should not see this',
    children: <Button label="Hover me">Hover me</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates disabling the tooltip via the `isEnabled` prop. When `isEnabled` is `false`, the tooltip will not appear on hover or focus, even though the trigger element remains fully interactive. This is useful for conditionally showing tooltips based on application state.',
      },
    },
  },
};

export const AllPlacements: Story = {
  render: () => (
    <div style={{padding: 100, display: 'flex', gap: 24, flexWrap: 'wrap'}}>
      <Tooltip content="Above" placement="above">
        <Button label="Above">Above</Button>
      </Tooltip>
      <Tooltip content="Below" placement="below">
        <Button label="Below">Below</Button>
      </Tooltip>
      <Tooltip content="Start" placement="start">
        <Button label="Start">Start</Button>
      </Tooltip>
      <Tooltip content="End" placement="end">
        <Button label="End">End</Button>
      </Tooltip>
    </div>
  ),
};

export const WithHook: Story = {
  render: function HookExample() {
    const tooltip = useTooltip({
      placement: 'above',
      delay: 100,
    });

    return (
      <div style={{padding: 100}}>
        <Button
          label="Using hook directly"
          ref={tooltip.ref}
          aria-describedby={tooltip.describedBy}>
          Using hook directly
        </Button>
        {tooltip.renderTooltip('Tooltip via hook')}
      </div>
    );
  },
};

export const LongContent: Story = {
  args: {
    placement: 'above',
    content:
      'This is a longer tooltip that contains more detailed information about the element.',
    children: <Button label="Hover for more info">Hover for more info</Button>,
  },
};

export const MultipleTooltips: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <HStack gap={4}>
        <Tooltip content="Save your changes" placement="above">
          <Button label="Save">Save</Button>
        </Tooltip>
        <Tooltip content="Discard changes" placement="above">
          <Button label="Cancel">Cancel</Button>
        </Tooltip>
        <Tooltip content="Delete permanently" placement="above">
          <Button label="Delete" variant="destructive">
            Delete
          </Button>
        </Tooltip>
      </HStack>
    </div>
  ),
};

export const TextNode: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <p>
        This paragraph contains a{' '}
        <Tooltip content="Tooltip on inline text!" placement="above">
          hover-able term
        </Tooltip>{' '}
        that explains what something means.
      </p>
    </div>
  ),
};

export const TextNodeInline: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <p>
        Learn more about our{' '}
        <Tooltip
          content="Your data is encrypted and never shared"
          placement="above">
          privacy policy
        </Tooltip>{' '}
        and{' '}
        <Tooltip content="Standard 30-day agreement" placement="above">
          terms of service
        </Tooltip>
        .
      </p>
    </div>
  ),
};

// =============================================================================
// Theme opt-out: surfaces.tooltip = 'normal'
// =============================================================================

/**
 * A theme that opts Tooltip out of the inverted media surface, so tooltips
 * render on the app's normal popover surface rather than the high-contrast
 * inverted panel.
 */
const normalTooltipTheme = defineTheme({
  name: 'tooltip-normal-surface',
  extends: neutralTheme,
  surfaces: {tooltip: 'normal'},
});

export const ThemedSurfaceOptOut: Story = {
  render: () => (
    <Stack gap={4}>
      <p>
        Tooltip renders on an inverted media surface by default (dark panel in a
        light app, light panel in a dark app). A theme can opt out with{' '}
        <code>
          surfaces: {'{'} tooltip: 'normal' {'}'}
        </code>
        , so tooltips use the app&apos;s ordinary popover surface tokens
        instead. Each column pins an explicit mode so the light/dark inversion
        is visible; both tooltips are pinned open for comparison.
      </p>
      {(['light', 'dark'] as const).map(mode => (
        <Stack key={mode} gap={2}>
          <strong>Mode: {mode}</strong>
          <HStack gap={8} style={{padding: '72px 40px'}}>
            <Theme theme={neutralTheme} mode={mode}>
              <Stack
                gap={2}
                hAlign="center"
                style={{
                  backgroundColor: 'var(--color-background-body)',
                  padding: 16,
                  borderRadius: 12,
                }}>
                <strong>Default (inverted)</strong>
                <Tooltip
                  content="Inverted surface tooltip"
                  isOpen
                  placement="below">
                  <Button label="Default" variant="secondary" />
                </Tooltip>
              </Stack>
            </Theme>
            <Theme theme={normalTooltipTheme} mode={mode}>
              <Stack
                gap={2}
                hAlign="center"
                style={{
                  backgroundColor: 'var(--color-background-body)',
                  padding: 16,
                  borderRadius: 12,
                }}>
                <strong>surfaces.tooltip = &apos;normal&apos;</strong>
                <Tooltip
                  content="Normal surface tooltip"
                  isOpen
                  placement="below">
                  <Button label="Opted out" variant="secondary" />
                </Tooltip>
              </Stack>
            </Theme>
          </HStack>
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Themes control whether Tooltip renders on the inverted media surface via `defineTheme({ surfaces: { tooltip: 'normal' } })`.",
      },
    },
  },
};

// =============================================================================
// Nested-surface fix: tooltip inside an already-inverted Toast
// =============================================================================

export const InsideInvertedToast: Story = {
  render: () => {
    const noop = () => {};
    return (
      <Stack gap={4}>
        <p>
          A tooltip rendered from a Toast&apos;s <code>endContent</code> now
          re-establishes its own inverted surface, so it stays legible instead
          of rendering dark-on-dark when nested inside the toast&apos;s already
          inverted surface.
        </p>
        <div style={{padding: '60px 40px'}}>
          <Theme theme={neutralTheme} mode="light">
            <Toast
              type="info"
              body="Workspace restored."
              isAutoHide={false}
              autoHideDuration={0}
              onDismiss={noop}
              endContent={
                <Tooltip
                  content="This tooltip is nested in the toast"
                  isOpen
                  placement="above">
                  <Button label="Details" variant="ghost" size="sm" />
                </Tooltip>
              }
            />
          </Theme>
        </div>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Regression demo: because Tooltip and Toast share one media-surface mechanism, a tooltip nested inside an inverted toast re-establishes its own surface tokens and remains legible.',
      },
    },
  },
};
