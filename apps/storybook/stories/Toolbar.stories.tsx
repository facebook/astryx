import type {Meta, StoryObj} from '@storybook/react';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {
  Cog6ToothIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSToolbar> = {
  title: 'Components/XDSToolbar',
  component: XDSToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the toolbar',
    },
    density: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'select',
      options: ['transparent', 'section', 'wash'],
    },
    gap: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSToolbar>;

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
      />
    ),
  },
};

export const ThreeSlot: Story = {
  render: () => (
    <XDSToolbar
      label="Editor toolbar"
      startContent={<XDSButton label="Back" variant="ghost" />}
      centerContent={<XDSText>Document.tsx</XDSText>}
      endContent={
        <>
          <XDSButton label="Share" variant="ghost" />
          <XDSButton label="Publish" variant="primary" />
        </>
      }
    />
  ),
};

export const CardHeader: Story = {
  render: () => (
    <XDSCard>
      <XDSToolbar
        label="User list actions"
        startContent={<XDSText weight="bold">Users</XDSText>}
        endContent={
          <>
            <XDSButton
              label="Filter"
              variant="ghost"
              icon={<FunnelIcon style={{width: 16, height: 16}} />}
            />
            <XDSButton
              label="Search"
              variant="ghost"
              icon={<MagnifyingGlassIcon style={{width: 16, height: 16}} />}
            />
            <XDSButton
              label="Add user"
              variant="primary"
              icon={<PlusIcon style={{width: 16, height: 16}} />}
            />
          </>
        }
      />
      <XDSSection>
        <XDSText>Table content goes here...</XDSText>
      </XDSSection>
    </XDSCard>
  ),
};

export const WithOverflow: Story = {
  render: () => (
    <div style={{maxWidth: 400}}>
      <XDSToolbar
        label="Formatting toolbar"
        startContent={
          <>
            <XDSButton label="Bold" variant="ghost" />
            <XDSButton label="Italic" variant="ghost" />
            <XDSButton label="Underline" variant="ghost" />
            <XDSButton label="Strikethrough" variant="ghost" />
            <XDSButton label="Code" variant="ghost" />
          </>
        }
        endContent={<XDSButton label="More" variant="ghost" />}
      />
      <XDSText color="secondary">
        Tip: Compose with XDSOverflowList inside slots to collapse items into a
        &quot;More&quot; menu when space is limited.
      </XDSText>
    </div>
  ),
};

export const StartOnly: Story = {
  args: {
    label: 'Navigation',
    startContent: (
      <>
        <XDSButton label="Home" variant="ghost" />
        <XDSButton label="Products" variant="ghost" />
        <XDSButton label="About" variant="ghost" />
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
        <XDSButton label="Save" variant="primary" />
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    label: 'Compact toolbar',
    density: 'compact',
    startContent: (
      <>
        <XDSButton label="Cut" variant="ghost" size="sm" />
        <XDSButton label="Copy" variant="ghost" size="sm" />
        <XDSButton label="Paste" variant="ghost" size="sm" />
      </>
    ),
    endContent: (
      <XDSButton
        label="Settings"
        variant="ghost"
        size="sm"
        icon={<Cog6ToothIcon style={{width: 14, height: 14}} />}
      />
    ),
  },
};

export const WashVariant: Story = {
  args: {
    label: 'Wash toolbar',
    variant: 'wash',
    startContent: (
      <>
        <XDSButton label="Bold" variant="ghost" />
        <XDSButton label="Italic" variant="ghost" />
      </>
    ),
    endContent: <XDSButton label="Save" variant="primary" />,
  },
};
