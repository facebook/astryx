import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
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
 * The command palette with the real input component and placeholder list content.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const items = [
      'Go to Dashboard',
      'Search Files',
      'Toggle Dark Mode',
      'Open Settings',
      'Create New File',
    ];

    const filtered = items.filter(item =>
      item.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <>
        <XDSButton
          label="Open Command Palette"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command..."
          />
          <XDSDivider />
          <div {...stylex.props(styles.list)}>
            {filtered.length > 0 ? (
              filtered.map(item => (
                <div key={item} {...stylex.props(styles.item)}>
                  <XDSText type="body">{item}</XDSText>
                </div>
              ))
            ) : (
              <XDSText type="body" color="secondary">
                No results found
              </XDSText>
            )}
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
 * Empty state — just the shell with input and no items.
 */
export const Empty: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Empty Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="No commands registered..." />
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
          <XDSCommandPaletteInput placeholder="Quick search..." />
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
