// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generated central inventory of all repository metadata roles and finite states.
 * @input Ephemeral owner discovery and the existing selected-theme Storybook toolbar
 * @output Isolated role glyphs and conformance metadata, including stateless true slots
 * @position Concrete inventory-location proposal; owner/component browser proof is separate
 */
import type {Meta, StoryObj} from '@storybook/react';
import type {IconSize} from '@astryxdesign/core/Icon';
import {slots} from 'virtual:astryx-icon-roles';
import {
  IconRoleInventory,
  InventoryTheme,
} from './icon-role-inventory/Inventory';
import {
  DirectProbe,
  syntheticTheme,
} from './icon-role-inventory/artwork.fixture';

type Args = {
  syntheticPolicy: boolean;
  source: 'mapped shared name' | 'ordinary direct probe';
  explicitSize: 'owner default' | 'xsm' | 'sm' | 'md' | 'lg';
};
const meta: Meta<Args> = {
  title: 'Core/Icon Role Inventory',
  parameters: {
    docs: {
      description: {
        component:
          'Proposed central role/state review surface. The roster and owner imports are generated, not maintained by hand. Synthetic fixtures demonstrate the pipeline until real owner roles join it. This isolated glyph inventory does not replace component stories, screenshots or owner approval.',
      },
    },
  },
  args: {
    syntheticPolicy: false,
    source: 'mapped shared name',
    explicitSize: 'owner default',
  },
  argTypes: {
    syntheticPolicy: {control: 'boolean'},
    source: {
      control: 'select',
      options: ['mapped shared name', 'ordinary direct probe'],
    },
    explicitSize: {
      control: 'select',
      options: ['owner default', 'xsm', 'sm', 'md', 'lg'],
    },
  },
  render: ({syntheticPolicy, source, explicitSize}, context) => {
    const inventory = (
      <IconRoleInventory
        slots={slots}
        direct={source === 'ordinary direct probe' ? DirectProbe : undefined}
        size={
          explicitSize === 'owner default'
            ? undefined
            : (explicitSize as IconSize)
        }
      />
    );
    return syntheticPolicy ? (
      <InventoryTheme
        theme={syntheticTheme}
        mode={context.globals.colorMode === 'dark' ? 'dark' : 'light'}>
        {inventory}
      </InventoryTheme>
    ) : (
      inventory
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Generated: Story = {};
export const SyntheticPolicy: Story = {args: {syntheticPolicy: true}};
