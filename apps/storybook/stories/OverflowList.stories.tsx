// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {OverflowList} from '@xds/core/OverflowList';
import {Button} from '@xds/core/Button';
import {Badge} from '@xds/core/Badge';
import {DropdownMenu} from '@xds/core/DropdownMenu';
import {TextInput} from '@xds/core/TextInput';

const meta: Meta<typeof OverflowList> = {
  title: 'Core/OverflowList',
  component: OverflowList,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: {type: 'number', min: 0, max: 10},
      description:
        'Gap between items as a spacing token step (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10)',
    },
    minVisibleItems: {
      control: {type: 'number', min: 0, max: 10},
      description: 'Minimum number of items to always show',
    },
    collapseFrom: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Which end to collapse items from',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OverflowList>;

// Basic usage - resize the container to see overflow behavior
export const Default: Story = {
  render: () => (
    <div style={{maxWidth: 400, border: '1px dashed #ccc', padding: 8}}>
      <OverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <Button
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <Button label="Edit" size="sm" />
        <Button label="Duplicate" size="sm" />
        <Button label="Share" size="sm" />
        <Button label="Archive" size="sm" />
        <Button label="Delete" size="sm" />
      </OverflowList>
    </div>
  ),
};

// Resizable container to interactively test overflow
export const Resizable: Story = {
  render: () => (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        padding: 8,
        width: 500,
        minWidth: 100,
        maxWidth: '100%',
      }}>
      <OverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <Button
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <Button label="Dashboard" size="sm" />
        <Button label="Analytics" size="sm" />
        <Button label="Reports" size="sm" />
        <Button label="Settings" size="sm" />
        <Button label="Users" size="sm" />
        <Button label="Billing" size="sm" />
        <Button label="Integrations" size="sm" />
      </OverflowList>
    </div>
  ),
};

// All items fit - no overflow indicator shown
export const NoOverflow: Story = {
  render: () => (
    <div style={{maxWidth: 600, border: '1px dashed #ccc', padding: 8}}>
      <OverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <Button
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <Button label="Edit" size="sm" />
        <Button label="Save" size="sm" />
      </OverflowList>
    </div>
  ),
};

// With badges instead of buttons
export const WithBadges: Story = {
  render: () => (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        padding: 8,
        width: 300,
        minWidth: 80,
      }}>
      <OverflowList
        gap={1}
        overflowRenderer={overflowItems => (
          <Badge variant="neutral" label={`+${overflowItems.length}`} />
        )}>
        <Badge variant="info" label="React" />
        <Badge variant="success" label="TypeScript" />
        <Badge variant="warning" label="StyleX" />
        <Badge variant="neutral" label="Storybook" />
        <Badge variant="error" label="Vitest" />
      </OverflowList>
    </div>
  ),
};

// Collapse from start
export const CollapseFromStart: Story = {
  render: () => (
    <div style={{maxWidth: 300, border: '1px dashed #ccc', padding: 8}}>
      <OverflowList
        gap={2}
        collapseFrom="start"
        overflowRenderer={overflowItems => (
          <Button
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <Button label="Step 1" size="sm" />
        <Button label="Step 2" size="sm" />
        <Button label="Step 3" size="sm" />
        <Button label="Step 4" size="sm" />
        <Button label="Step 5" size="sm" />
      </OverflowList>
    </div>
  ),
};

// With dropdown menu as overflow indicator
export const WithDropdownOverflow: Story = {
  render: () => {
    const actions = ['Save', 'Edit', 'Duplicate', 'Share', 'Archive', 'Delete'];
    return (
      <div
        style={{
          resize: 'horizontal',
          overflow: 'hidden',
          border: '1px dashed #ccc',
          padding: 8,
          width: 350,
          minWidth: 100,
          maxWidth: '100%',
        }}>
        <OverflowList
          gap={2}
          overflowRenderer={overflowItems => (
            <DropdownMenu
              button={{
                label: `+${overflowItems.length}`,
                variant: 'ghost',
                size: 'sm',
              }}
              items={overflowItems.map(({index}) => ({
                label: actions[index],
                onClick: () => console.log(actions[index]),
              }))}
            />
          )}>
          <Button label="Save" size="sm" variant="primary" />
          <Button label="Edit" size="sm" />
          <Button label="Duplicate" size="sm" />
          <Button label="Share" size="sm" />
          <Button label="Archive" size="sm" />
          <Button label="Delete" size="sm" variant="destructive" />
        </OverflowList>
      </div>
    );
  },
};

// Alongside another element — the input wraps and hides when space is tight
export const WithSiblingElement: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    return (
      <div
        style={{
          resize: 'horizontal',
          overflow: 'hidden',
          border: '1px dashed #ccc',
          minWidth: 100,
          width: 600,
        }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            height: 44,
          }}>
          <OverflowList
            gap={2}
            behavior="observeParent"
            overflowRenderer={overflowItems => (
              <Button
                label={`+${overflowItems.length} more`}
                variant="ghost"
                size="sm"
              />
            )}>
            <Button label="Dashboard" size="sm" />
            <Button label="Analytics" size="sm" />
            <Button label="Reports" size="sm" />
            <Button label="Settings" size="sm" />
            <Button label="Users" size="sm" />
            <Button label="Billing" size="sm" />
          </OverflowList>
          <div style={{width: 70, flexShrink: 0}}>
            <TextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              size="sm"
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Dynamic items
export const DynamicItems: Story = {
  render: () => {
    const [count, setCount] = useState(5);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <Button
            label="Remove"
            size="sm"
            onClick={() => setCount(c => Math.max(1, c - 1))}
          />
          <Button
            label="Add"
            size="sm"
            onClick={() => setCount(c => c + 1)}
          />
          <span>{count} items</span>
        </div>
        <div
          style={{
            resize: 'horizontal',
            overflow: 'hidden',
            border: '1px dashed #ccc',
            padding: 8,
            width: 400,
            minWidth: 100,
            maxWidth: '100%',
          }}>
          <OverflowList
            gap={2}
            overflowRenderer={items => (
              <Button
                label={`+${items.length} more`}
                variant="ghost"
                size="sm"
              />
            )}>
            {Array.from({length: count}, (_, i) => (
              <Button key={i} label={`Item ${i + 1}`} size="sm" />
            ))}
          </OverflowList>
        </div>
      </div>
    );
  },
};
