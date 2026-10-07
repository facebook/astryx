// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  CommandPalette,
  CommandPaletteEmpty,
} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';

const meta: Meta<typeof CommandPaletteEmpty> = {
  title: 'Core/CommandPaletteEmpty',
  component: CommandPaletteEmpty,
  tags: ['autodocs', 'visual-theme-matrix'],
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AuditMatrix: Story = {
  render: function Render() {
    const source = useMemo(() => createStaticSource([]), []);
    return (
      <CommandPalette
        isOpen
        onOpenChange={() => {}}
        searchSource={source}
        emptyBootstrapText="No matching commands. Try a different search phrase."
      />
    );
  },
};
