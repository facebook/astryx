import type {Meta, StoryObj} from '@storybook/react';
import {XDSPopover} from '@xds/core/Layer';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

const meta: Meta<typeof XDSPopover> = {
  title: 'Core/XDSPopover',
  component: XDSPopover,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: 'How the popover is triggered',
    },
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
    isEnabled: {
      control: 'boolean',
      description: 'Enable/disable the popover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSPopover>;

function PopoverContent() {
  return (
    <XDSVStack gap="space2">
      <div style={{fontWeight: 600}} tabIndex={-1}>
        Popover Title
      </div>
      <div style={{fontSize: 14}}>
        This is some popover content. It can contain any React elements.
      </div>
    </XDSVStack>
  );
}

export const Default: Story = {
  args: {
    trigger: 'click',
    placement: 'below',
    label: 'Example popover',
    content: <PopoverContent />,
    children: <XDSButton label="Open popover">Open popover</XDSButton>,
  },
};

export const Above: Story = {
  render: () => (
    <div style={{paddingTop: 200}}>
      <XDSPopover
        trigger="click"
        placement="above"
        label="Above popover"
        content={<PopoverContent />}>
        <XDSButton label="Above">Above</XDSButton>
      </XDSPopover>
    </div>
  ),
};

export const HoverTrigger: Story = {
  args: {
    trigger: 'hover',
    placement: 'below',
    content: <PopoverContent />,
    children: <XDSButton label="Hover me">Hover me</XDSButton>,
  },
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [isShown, setIsShown] = React.useState(false);
    return (
      <div style={{padding: 100}}>
        <XDSPopover
          trigger="click"
          placement="below"
          label="Controlled popover"
          isShown={isShown}
          onToggle={setIsShown}
          content={
            <XDSVStack gap="space2">
              <div>Controlled popover</div>
              <XDSButton
                label="Close"
                variant="primary"
                onClick={() => setIsShown(false)}>
                Close
              </XDSButton>
            </XDSVStack>
          }>
          <XDSButton label="Toggle" onClick={() => setIsShown(!isShown)}>
            {isShown ? 'Close' : 'Open'}
          </XDSButton>
        </XDSPopover>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    trigger: 'click',
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <PopoverContent />,
    children: <XDSButton label="Disabled popover">Disabled popover</XDSButton>,
  },
};

// Need React import for Controlled story
import React from 'react';
