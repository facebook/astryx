import type {Meta, StoryObj} from '@storybook/react';
import {XDSKbd} from '@xds/core/Kbd';

const meta: Meta<typeof XDSKbd> = {
  title: 'Core/XDSKbd',
  component: XDSKbd,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof XDSKbd>;

/**
 * Single modifier + key shortcut.
 */
export const Basic: Story = {
  args: {
    keys: 'mod+k',
  },
};

/**
 * Multi-modifier shortcut.
 */
export const MultiModifier: Story = {
  args: {
    keys: 'mod+shift+p',
  },
};

/**
 * Common keyboard shortcuts displayed together.
 */
export const CommonShortcuts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 24}}>
      <XDSKbd keys="mod+c" />
      <XDSKbd keys="mod+v" />
      <XDSKbd keys="mod+s" />
      <XDSKbd keys="mod+z" />
    </div>
  ),
};

/**
 * Special keys like Enter, Escape, Tab, and arrow keys.
 */
export const SpecialKeys: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16}}>
      <XDSKbd keys="enter" />
      <XDSKbd keys="escape" />
      <XDSKbd keys="tab" />
      <XDSKbd keys="up" />
      <XDSKbd keys="down" />
      <XDSKbd keys="backspace" />
    </div>
  ),
};

/**
 * Single key without modifiers.
 */
export const SingleKey: Story = {
  args: {
    keys: 'k',
  },
};
