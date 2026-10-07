// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  CommandPalette,
  CommandPaletteFooter,
} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';

const meta: Meta<typeof CommandPaletteFooter> = {
  title: 'Core/CommandPaletteFooter',
  component: CommandPaletteFooter,
  tags: ['autodocs', 'visual-theme-matrix'],
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

function Palette({customFooter}: {customFooter: boolean}) {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Go home'},
        {id: 'settings', label: 'Open settings'},
      ]),
    [],
  );
  return (
    <CommandPalette
      isOpen
      onOpenChange={() => {}}
      searchSource={source}
      footer={
        customFooter ? (
          <CommandPaletteFooter>
            Type to filter available commands.
          </CommandPaletteFooter>
        ) : undefined
      }
    />
  );
}

/** The built-in CommandPalette branch with translated keyboard guidance. */
export const Default: Story = {
  render: () => <Palette customFooter={false} />,
};

/** A caller-provided footer replaces the built-in guidance in the real slot. */
export const CustomContent: Story = {
  render: () => <Palette customFooter />,
};
