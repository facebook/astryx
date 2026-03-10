import type {Meta, StoryObj} from '@storybook/react';
import {XDSKbd} from '@xds/core/Kbd';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSKbd> = {
  title: 'Core/XDSKbd',
  component: XDSKbd,
  tags: ['autodocs'],
  argTypes: {
    keys: {
      control: 'text',
      description:
        'Keyboard shortcut string. Use "+" to separate keys. Special keys: mod, ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSKbd>;

// =============================================================================
// Basic Usage
// =============================================================================

export const Default: Story = {
  args: {
    keys: 'k',
  },
};

// =============================================================================
// Modifier Combinations
// =============================================================================

export const ModifierCombinations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSKbd keys="mod+k" />
      <XDSKbd keys="shift+enter" />
      <XDSKbd keys="ctrl+c" />
      <XDSKbd keys="alt+tab" />
    </div>
  ),
};

// =============================================================================
// Multiple Modifiers
// =============================================================================

export const MultipleModifiers: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSKbd keys="mod+shift+z" />
      <XDSKbd keys="ctrl+alt+delete" />
      <XDSKbd keys="mod+shift+p" />
    </div>
  ),
};

// =============================================================================
// Special Keys
// =============================================================================

export const SpecialKeys: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Escape:
        </XDSText>
        <XDSKbd keys="escape" />
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Enter:
        </XDSText>
        <XDSKbd keys="enter" />
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Backspace:
        </XDSText>
        <XDSKbd keys="backspace" />
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Tab:
        </XDSText>
        <XDSKbd keys="tab" />
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Space:
        </XDSText>
        <XDSKbd keys="space" />
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '100px'}}>
          Arrow Keys:
        </XDSText>
        <XDSKbd keys="up" />
        <XDSKbd keys="down" />
        <XDSKbd keys="left" />
        <XDSKbd keys="right" />
      </div>
    </div>
  ),
};

// =============================================================================
// Single Letter Keys
// =============================================================================

export const SingleLetterKeys: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSKbd keys="a" />
      <XDSKbd keys="b" />
      <XDSKbd keys="c" />
      <XDSKbd keys="x" />
      <XDSKbd keys="y" />
      <XDSKbd keys="z" />
    </div>
  ),
};

// =============================================================================
// All Modifier Symbols
// =============================================================================

export const AllModifierSymbols: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '120px'}}>
          Cmd (mod):
        </XDSText>
        <XDSKbd keys="mod" />
        <XDSText type="supporting">⌘</XDSText>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '120px'}}>
          Ctrl:
        </XDSText>
        <XDSKbd keys="ctrl" />
        <XDSText type="supporting">⌃</XDSText>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '120px'}}>
          Alt/Option:
        </XDSText>
        <XDSKbd keys="alt" />
        <XDSText type="supporting">⌥</XDSText>
      </div>
      <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <XDSText type="label" style={{width: '120px'}}>
          Shift:
        </XDSText>
        <XDSKbd keys="shift" />
        <XDSText type="supporting">⇧</XDSText>
      </div>
    </div>
  ),
};

// =============================================================================
// Inline with Text
// =============================================================================

export const InlineWithText: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSText type="body">
        Press <XDSKbd keys="mod+k" /> to open the command palette.
      </XDSText>
      <XDSText type="body">
        Use <XDSKbd keys="mod+shift+p" /> to access all commands.
      </XDSText>
      <XDSText type="body">
        Press <XDSKbd keys="escape" /> to close the dialog.
      </XDSText>
      <XDSText type="body">
        Navigate with <XDSKbd keys="up" /> and <XDSKbd keys="down" /> arrow
        keys, then press <XDSKbd keys="enter" /> to select.
      </XDSText>
    </div>
  ),
};

// =============================================================================
// Real-World Examples
// =============================================================================

export const MenuShortcuts: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        width: '250px',
      }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
        }}>
        <XDSText type="body">Cut</XDSText>
        <XDSKbd keys="mod+x" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
        }}>
        <XDSText type="body">Copy</XDSText>
        <XDSKbd keys="mod+c" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
        }}>
        <XDSText type="body">Paste</XDSText>
        <XDSKbd keys="mod+v" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
        }}>
        <XDSText type="body">Undo</XDSText>
        <XDSKbd keys="mod+z" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px',
        }}>
        <XDSText type="body">Redo</XDSText>
        <XDSKbd keys="mod+shift+z" />
      </div>
    </div>
  ),
};
