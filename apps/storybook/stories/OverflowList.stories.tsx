import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSTextInput} from '@xds/core/TextInput';

const meta: Meta<typeof XDSOverflowList> = {
  title: 'Core/XDSOverflowList',
  component: XDSOverflowList,
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
type Story = StoryObj<typeof XDSOverflowList>;

// Basic usage - resize the container to see overflow behavior
export const Default: Story = {
  render: () => (
    <div style={{maxWidth: 400, border: '1px dashed #ccc', padding: 8}}>
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Edit" size="sm" />
        <XDSButton label="Duplicate" size="sm" />
        <XDSButton label="Share" size="sm" />
        <XDSButton label="Archive" size="sm" />
        <XDSButton label="Delete" size="sm" />
      </XDSOverflowList>
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
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Dashboard" size="sm" />
        <XDSButton label="Analytics" size="sm" />
        <XDSButton label="Reports" size="sm" />
        <XDSButton label="Settings" size="sm" />
        <XDSButton label="Users" size="sm" />
        <XDSButton label="Billing" size="sm" />
        <XDSButton label="Integrations" size="sm" />
      </XDSOverflowList>
    </div>
  ),
};

// All items fit - no overflow indicator shown
export const NoOverflow: Story = {
  render: () => (
    <div style={{maxWidth: 600, border: '1px dashed #ccc', padding: 8}}>
      <XDSOverflowList
        gap={2}
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Edit" size="sm" />
        <XDSButton label="Save" size="sm" />
      </XDSOverflowList>
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
      <XDSOverflowList
        gap={1}
        overflowRenderer={overflowItems => (
          <XDSBadge variant="neutral" label={`+${overflowItems.length}`} />
        )}>
        <XDSBadge variant="info" label="React" />
        <XDSBadge variant="success" label="TypeScript" />
        <XDSBadge variant="warning" label="StyleX" />
        <XDSBadge variant="neutral" label="Storybook" />
        <XDSBadge variant="error" label="Vitest" />
      </XDSOverflowList>
    </div>
  ),
};

// Collapse from start
export const CollapseFromStart: Story = {
  render: () => (
    <div style={{maxWidth: 300, border: '1px dashed #ccc', padding: 8}}>
      <XDSOverflowList
        gap={2}
        collapseFrom="start"
        overflowRenderer={overflowItems => (
          <XDSButton
            label={`+${overflowItems.length} more`}
            variant="ghost"
            size="sm"
          />
        )}>
        <XDSButton label="Step 1" size="sm" />
        <XDSButton label="Step 2" size="sm" />
        <XDSButton label="Step 3" size="sm" />
        <XDSButton label="Step 4" size="sm" />
        <XDSButton label="Step 5" size="sm" />
      </XDSOverflowList>
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
        <XDSOverflowList
          gap={2}
          overflowRenderer={overflowItems => (
            <XDSDropdownMenu
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
          <XDSButton label="Save" size="sm" variant="primary" />
          <XDSButton label="Edit" size="sm" />
          <XDSButton label="Duplicate" size="sm" />
          <XDSButton label="Share" size="sm" />
          <XDSButton label="Archive" size="sm" />
          <XDSButton label="Delete" size="sm" variant="destructive" />
        </XDSOverflowList>
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
          <XDSOverflowList
            gap={2}
            behavior="observeParent"
            overflowRenderer={overflowItems => (
              <XDSButton
                label={`+${overflowItems.length} more`}
                variant="ghost"
                size="sm"
              />
            )}>
            <XDSButton label="Dashboard" size="sm" />
            <XDSButton label="Analytics" size="sm" />
            <XDSButton label="Reports" size="sm" />
            <XDSButton label="Settings" size="sm" />
            <XDSButton label="Users" size="sm" />
            <XDSButton label="Billing" size="sm" />
          </XDSOverflowList>
          <div style={{width: 70, flexShrink: 0}}>
            <XDSTextInput
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
          <XDSButton
            label="Remove"
            size="sm"
            onClick={() => setCount(c => Math.max(1, c - 1))}
          />
          <XDSButton
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
          <XDSOverflowList
            gap={2}
            overflowRenderer={items => (
              <XDSButton
                label={`+${items.length} more`}
                variant="ghost"
                size="sm"
              />
            )}>
            {Array.from({length: count}, (_, i) => (
              <XDSButton key={i} label={`Item ${i + 1}`} size="sm" />
            ))}
          </XDSOverflowList>
        </div>
      </div>
    );
  },
};
