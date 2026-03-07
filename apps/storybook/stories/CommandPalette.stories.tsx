import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  input: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  item: {
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  footer: {
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
});

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Core/XDSCommandPalette',
  component: XDSCommandPalette,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the command palette is open',
    },
    width: {
      control: 'number',
      description: 'Width of the dialog',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height of the dialog',
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCommandPalette>;

/**
 * The command palette dialog shell with placeholder content.
 * This demonstrates the structural layout — input, list, and footer slots.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton
          label="Open Command Palette"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <input
            placeholder="Type a command..."
            {...stylex.props(styles.input)}
          />
          <XDSDivider />
          <div {...stylex.props(styles.list)}>
            <div {...stylex.props(styles.item)}>
              <XDSText type="body">Go to Dashboard</XDSText>
            </div>
            <div {...stylex.props(styles.item)}>
              <XDSText type="body">Search Files</XDSText>
            </div>
            <div {...stylex.props(styles.item)}>
              <XDSText type="body">Toggle Dark Mode</XDSText>
            </div>
          </div>
          <XDSDivider />
          <div {...stylex.props(styles.footer)}>
            <XDSText type="body" size="sm" color="secondary">
              ESC to close
            </XDSText>
          </div>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Empty state — just the dialog shell with no content.
 */
export const Empty: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Empty Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <input
            placeholder="No commands registered..."
            {...stylex.props(styles.input)}
          />
          <XDSDivider />
          <div {...stylex.props(styles.list)}>
            <XDSText type="body" color="secondary">
              No results found
            </XDSText>
          </div>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Custom dimensions — narrower and shorter.
 */
export const CustomSize: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Small Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          width={400}
          maxHeight={300}>
          <input
            placeholder="Quick search..."
            {...stylex.props(styles.input)}
          />
          <XDSDivider />
          <div {...stylex.props(styles.list)}>
            <div {...stylex.props(styles.item)}>
              <XDSText type="body">Option A</XDSText>
            </div>
            <div {...stylex.props(styles.item)}>
              <XDSText type="body">Option B</XDSText>
            </div>
          </div>
        </XDSCommandPalette>
      </>
    );
  },
};
