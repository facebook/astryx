import type {Meta, StoryObj} from '@storybook/react';
import {XDSTooltip, useXDSTooltip} from '@xds/core/Tooltip';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';

const meta: Meta<typeof XDSTooltip> = {
  title: 'Core/XDSTooltip',
  component: XDSTooltip,
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
type Story = StoryObj<typeof XDSTooltip>;

export const Default: Story = {
  args: {
    placement: 'above',
    content: 'This is a helpful tooltip',
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
  },
};

export const Below: Story = {
  args: {
    placement: 'below',
    content: 'Tooltip appears below',
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
  },
};

export const Start: Story = {
  args: {
    placement: 'start',
    content: 'Tooltip on start',
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
  },
};

export const End: Story = {
  args: {
    placement: 'end',
    content: 'Tooltip on end',
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
  },
};

export const CustomDelay: Story = {
  args: {
    placement: 'above',
    delay: 500,
    content: 'Slower tooltip (500ms delay)',
    children: <XDSButton label="Slow tooltip">Slow tooltip</XDSButton>,
  },
};

export const Disabled: Story = {
  name: 'Disabled Tooltip',
  args: {
    placement: 'above',
    isEnabled: false,
    content: 'You should not see this',
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
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
      <XDSTooltip content="Above" placement="above">
        <XDSButton label="Above">Above</XDSButton>
      </XDSTooltip>
      <XDSTooltip content="Below" placement="below">
        <XDSButton label="Below">Below</XDSButton>
      </XDSTooltip>
      <XDSTooltip content="Start" placement="start">
        <XDSButton label="Start">Start</XDSButton>
      </XDSTooltip>
      <XDSTooltip content="End" placement="end">
        <XDSButton label="End">End</XDSButton>
      </XDSTooltip>
    </div>
  ),
};

export const WithHook: Story = {
  render: function HookExample() {
    const tooltip = useXDSTooltip({
      placement: 'above',
      delay: 100,
    });

    return (
      <div style={{padding: 100}}>
        <XDSButton
          label="Using hook directly"
          ref={tooltip.ref}
          aria-describedby={tooltip.describedBy}>
          Using hook directly
        </XDSButton>
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
    children: (
      <XDSButton label="Hover for more info">Hover for more info</XDSButton>
    ),
  },
};

export const MultipleTooltips: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <XDSHStack gap={4}>
        <XDSTooltip content="Save your changes" placement="above">
          <XDSButton label="Save">Save</XDSButton>
        </XDSTooltip>
        <XDSTooltip content="Discard changes" placement="above">
          <XDSButton label="Cancel">Cancel</XDSButton>
        </XDSTooltip>
        <XDSTooltip content="Delete permanently" placement="above">
          <XDSButton label="Delete" variant="destructive">
            Delete
          </XDSButton>
        </XDSTooltip>
      </XDSHStack>
    </div>
  ),
};

export const TextNode: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <p>
        This paragraph contains a{' '}
        <XDSTooltip content="Tooltip on inline text!" placement="above">
          hover-able term
        </XDSTooltip>{' '}
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
        <XDSTooltip
          content="Your data is encrypted and never shared"
          placement="above">
          privacy policy
        </XDSTooltip>{' '}
        and{' '}
        <XDSTooltip content="Standard 30-day agreement" placement="above">
          terms of service
        </XDSTooltip>
        .
      </p>
    </div>
  ),
};
