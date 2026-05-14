import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import {XDSLayout} from '@xds/core/Layout';
import {XDSLayoutHeader} from '@xds/core/Layout';
import {XDSLayoutContent} from '@xds/core/Layout';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSHeading} from '@xds/core/Text';
import {
  Cog6ToothIcon,
  FunnelIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSToolbar> = {
  title: 'Core/Toolbar',
  component: XDSToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: {control: 'text'},
    size: {control: 'radio', options: ['sm', 'md', 'lg']},
    orientation: {control: 'radio', options: ['horizontal', 'vertical']},
    variant: {control: 'select', options: ['transparent', 'section', 'muted']},
    gap: {control: 'number'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSToolbar>;

// ---------------------------------------------------------------------------
// Basic slot patterns
// ---------------------------------------------------------------------------

/** Two-slot layout: start + end content with space-between. */
export const Default: Story = {
  args: {
    label: 'Actions',
    startContent: (
      <>
        <XDSButton label="Cut" variant="ghost" />
        <XDSButton label="Copy" variant="ghost" />
        <XDSButton label="Paste" variant="ghost" />
      </>
    ),
    endContent: (
      <XDSButton
        label="Settings"
        variant="ghost"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        isIconOnly
      />
    ),
  },
};

/** Three-slot layout: CSS grid 1fr auto 1fr. Center content stays centered regardless of start/end width. */
export const ThreeSlot: Story = {
  render: () => (
    <XDSToolbar
      label="Document toolbar"
      startContent={
        <XDSButton
          label="Back"
          variant="ghost"
          icon={<ArrowLeftIcon style={{width: 16, height: 16}} />}
          isIconOnly
        />
      }
      centerContent={<XDSHeading level={4}>Q1 Planning Document</XDSHeading>}
      endContent={
        <>
          <XDSButton label="Discard" variant="secondary" />
          <XDSButton label="Save" />
        </>
      }
    />
  ),
};

export const StartOnly: Story = {
  args: {
    label: 'Bulk actions',
    size: 'sm',
    startContent: (
      <>
        <XDSBadge label="3 selected" />
        <XDSButton label="Delete" variant="ghost" />
        <XDSButton label="Archive" variant="ghost" />
      </>
    ),
  },
};

export const EndOnly: Story = {
  args: {
    label: 'Page actions',
    endContent: (
      <>
        <XDSButton label="Cancel" variant="ghost" />
        <XDSButton label="Save" />
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    label: 'Compact toolbar',
    size: 'sm',
    startContent: (
      <>
        <XDSButton label="Cut" variant="ghost" />
        <XDSButton label="Copy" variant="ghost" />
        <XDSButton label="Paste" variant="ghost" />
      </>
    ),
    endContent: (
      <XDSButton
        label="Settings"
        variant="ghost"
        icon={<Cog6ToothIcon style={{width: 14, height: 14}} />}
        isIconOnly
      />
    ),
  },
};

export const WashVariant: Story = {
  args: {
    label: 'Highlighted toolbar',
    variant: 'muted',
    startContent: <XDSText type="body">3 items selected</XDSText>,
    endContent: (
      <>
        <XDSButton label="Delete" variant="ghost" />
        <XDSButton label="Move" variant="ghost" />
      </>
    ),
  },
};

// ---------------------------------------------------------------------------
// Composition patterns — real-world layouts
// ---------------------------------------------------------------------------

/** Toolbar as a Card header. Compact density for card context. */
export const InsideCard: Story = {
  name: 'Composition: Card Header',
  render: () => (
    <XDSCard width={600}>
      <XDSToolbar
        label="User list actions"
        size="sm"
        dividers={['bottom']}
        startContent={<XDSHeading level={4}>Users</XDSHeading>}
        endContent={
          <>
            <XDSButton
              label="Filter"
              variant="ghost"
              icon={<FunnelIcon style={{width: 16, height: 16}} />}
              isIconOnly
            />
            <XDSButton
              label="Add user"
              icon={<PlusIcon style={{width: 16, height: 16}} />}
              isIconOnly
            />
          </>
        }
      />
      <XDSSection>
        <XDSText type="body">Table rows go here...</XDSText>
      </XDSSection>
    </XDSCard>
  ),
};

/** Toolbar above a data table with search + filter buttons + view controls. */
export const TableToolbar: Story = {
  name: 'Composition: Table Toolbar',
  render: () => (
    <div style={{width: 700}}>
      <XDSToolbar
        label="Table filters"
        size="sm"
        startContent={
          <>
            <XDSTextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              value=""
              onChange={() => {}}
            />
            <XDSButton label="Status" variant="secondary" />
            <XDSButton label="Priority" variant="secondary" />
            <XDSButton label="Assignee" variant="secondary" />
          </>
        }
        endContent={
          <XDSMoreMenu
            items={[
              {label: 'Compact view'},
              {label: 'Comfortable view'},
              {label: 'Export CSV'},
            ]}
          />
        }
      />
      <XDSTable
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'status', header: 'Status'},
          {key: 'priority', header: 'Priority'},
        ]}
        data={[
          {name: 'Fix login bug', status: 'Open', priority: 'High'},
          {name: 'Update docs', status: 'In Progress', priority: 'Medium'},
          {name: 'Add tests', status: 'Open', priority: 'Low'},
        ]}
      />
    </div>
  ),
};

/** Page-level toolbar with back nav, centered title, and actions. */
export const PageHeader: Story = {
  name: 'Composition: Page Header',
  render: () => (
    <XDSCard>
      <XDSToolbar
        label="Page navigation"
        dividers={['bottom']}
        startContent={
          <XDSButton
            label="Back to projects"
            variant="ghost"
            icon={<ArrowLeftIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
        }
        centerContent={<XDSHeading level={3}>Project Settings</XDSHeading>}
        endContent={
          <>
            <XDSButton label="Reset" variant="ghost" />
            <XDSButton label="Save changes" />
          </>
        }
      />
      <XDSSection>
        <XDSText type="body">Settings form content...</XDSText>
      </XDSSection>
    </XDSCard>
  ),
};

/** Bulk selection toolbar with badge count + action buttons. */
export const BulkActions: Story = {
  name: 'Composition: Bulk Selection',
  render: () => (
    <XDSToolbar
      label="Bulk actions"
      size="sm"
      variant="muted"
      startContent={
        <>
          <XDSBadge label="5 selected" />
          <XDSButton
            label="Delete"
            variant="ghost"
            icon={<TrashIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
          <XDSButton
            label="Archive"
            variant="ghost"
            icon={<ArchiveBoxIcon style={{width: 16, height: 16}} />}
            isIconOnly
          />
        </>
      }
      endContent={<XDSButton label="Deselect all" variant="ghost" />}
    />
  ),
};

/** Stacked toolbars: primary actions above, secondary filters below. */
export const StackedToolbars: Story = {
  name: 'Composition: Stacked Toolbars',
  render: () => (
    <XDSCard width={700}>
      <XDSToolbar
        label="Primary actions"
        size="sm"
        dividers={['bottom']}
        startContent={<XDSHeading level={4}>Orders</XDSHeading>}
        endContent={
          <>
            <XDSButton
              label="Refresh"
              variant="ghost"
              icon={<ArrowPathIcon style={{width: 16, height: 16}} />}
              isIconOnly
            />
            <XDSButton
              label="Export"
              variant="ghost"
              icon={<ArrowDownTrayIcon style={{width: 16, height: 16}} />}
              isIconOnly
            />
            <XDSButton label="New order" />
          </>
        }
      />
      <XDSToolbar
        label="Filters"
        size="sm"
        variant="muted"
        startContent={
          <>
            <XDSTextInput
              label="Search orders"
              isLabelHidden
              placeholder="Search orders..."
              value=""
              onChange={() => {}}
            />
            <XDSButton label="Status" variant="secondary" />
            <XDSButton label="Date range" variant="secondary" />
            <XDSButton label="Customer" variant="secondary" />
          </>
        }
        endContent={<XDSButton label="Clear filters" variant="ghost" />}
      />
      <XDSSection>
        <XDSText type="body">Order table rows...</XDSText>
      </XDSSection>
    </XDSCard>
  ),
};

/** Inside a Layout header — toolbar inherits the layout's padding context. */
export const InsideLayout: Story = {
  name: 'Composition: Inside Layout',
  render: () => (
    <div style={{height: 300, border: '1px solid #e0e0e0', borderRadius: 8}}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider padding={0}>
            <XDSToolbar
              label="App toolbar"
              startContent={
                <>
                  <XDSHeading level={4}>Dashboard</XDSHeading>
                  <XDSBadge label="Beta" variant="info" />
                </>
              }
              endContent={
                <>
                  <XDSButton label="Notifications" variant="ghost" />
                  <XDSMoreMenu
                    items={[
                      {label: 'Profile'},
                      {label: 'Settings'},
                      {label: 'Sign out'},
                    ]}
                  />
                </>
              }
            />
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <XDSText type="body">Dashboard content...</XDSText>
          </XDSLayoutContent>
        }
      />
    </div>
  ),
};

/** Toolbar with tab navigation. Size cascades from toolbar to tabs and buttons. */
export const WithTabNavigation: Story = {
  name: 'Composition: Tab Navigation',
  render: () => {
    const [tab, setTab] = useState('overview');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <XDSCard key={size}>
            <XDSToolbar
              label={`Tab navigation (${size})`}
              size={size}
              dividers={['bottom']}
              startContent={
                <XDSTabList value={tab} onChange={setTab}>
                  <XDSTab value="overview" label="Overview" />
                  <XDSTab value="analytics" label="Analytics" />
                  <XDSTab value="settings" label="Settings" />
                </XDSTabList>
              }
              endContent={
                <>
                  <XDSButton
                    label="Export"
                    variant="ghost"
                    icon={<ArrowDownTrayIcon style={{width: 16, height: 16}} />}
                    isIconOnly
                  />
                  <XDSButton label="New item" />
                </>
              }
            />
            <XDSSection>
              <XDSText type="body">Content for {size} size variant</XDSText>
            </XDSSection>
          </XDSCard>
        ))}
      </div>
    );
  },
};
