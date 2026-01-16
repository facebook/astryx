import type { Meta, StoryObj } from '@storybook/react';
import { XDSHoverCard, useXDSHoverCard } from '@xds/core/Layer';
import { XDSButton } from '@xds/core/Button';
import { XDSVStack, XDSHStack } from '@xds/core/Layout';

const meta: Meta<typeof XDSHoverCard> = {
  title: 'Core/XDSHoverCard',
  component: XDSHoverCard,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description: 'Position relative to trigger',
    },
    alignment: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment on placement axis',
    },
    delay: {
      control: 'number',
      description: 'Show delay in ms',
    },
    hideDelay: {
      control: 'number',
      description: 'Hide delay in ms',
    },
    isEnabled: {
      control: 'boolean',
      description: 'Enable/disable the hover card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSHoverCard>;

// Sample content for hover cards
function ProfileCard() {
  return (
    <div style={{ width: 200 }}>
      <XDSVStack gap="space2">
        <div style={{ fontWeight: 600 }}>Jane Doe</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Software Engineer</div>
        <div style={{ fontSize: 13 }}>
          Building great products with great people.
        </div>
      </XDSVStack>
    </div>
  );
}

export const Default: Story = {
  args: {
    placement: 'above',
    content: <ProfileCard />,
    children: <XDSButton>Hover me</XDSButton>,
  },
};

export const Below: Story = {
  args: {
    placement: 'below',
    content: <ProfileCard />,
    children: <XDSButton>Hover me</XDSButton>,
  },
};

export const Start: Story = {
  args: {
    placement: 'start',
    content: <ProfileCard />,
    children: <XDSButton>Hover me</XDSButton>,
  },
};

export const End: Story = {
  args: {
    placement: 'end',
    content: <ProfileCard />,
    children: <XDSButton>Hover me</XDSButton>,
  },
};

export const CustomDelay: Story = {
  args: {
    placement: 'above',
    delay: 500,
    hideDelay: 300,
    content: <ProfileCard />,
    children: <XDSButton>Slow hover (500ms)</XDSButton>,
  },
};

export const Disabled: Story = {
  args: {
    placement: 'above',
    isEnabled: false,
    content: <ProfileCard />,
    children: <XDSButton>Hover disabled</XDSButton>,
  },
};

export const AllPlacements: Story = {
  render: () => (
    <div style={{ padding: 100, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <XDSHoverCard content={<ProfileCard />} placement="above">
        <XDSButton>Above</XDSButton>
      </XDSHoverCard>
      <XDSHoverCard content={<ProfileCard />} placement="below">
        <XDSButton>Below</XDSButton>
      </XDSHoverCard>
      <XDSHoverCard content={<ProfileCard />} placement="start">
        <XDSButton>Start</XDSButton>
      </XDSHoverCard>
      <XDSHoverCard content={<ProfileCard />} placement="end">
        <XDSButton>End</XDSButton>
      </XDSHoverCard>
    </div>
  ),
};

export const WithHook: Story = {
  render: function HookExample() {
    const hoverCard = useXDSHoverCard({
      placement: 'above',
      delay: 200,
    });

    return (
      <div style={{ padding: 100 }}>
        <XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
          Using hook directly
        </XDSButton>
        {hoverCard.renderHoverCard(<ProfileCard />)}
      </div>
    );
  },
};

export const InteractiveContent: Story = {
  render: () => (
    <div style={{ padding: 100 }}>
      <XDSHoverCard
        placement="below"
        content={
          <XDSVStack gap="space2">
            <div>Interactive hover card content</div>
            <XDSHStack gap="space2">
              <XDSButton variant="primary">Follow</XDSButton>
              <XDSButton>Message</XDSButton>
            </XDSHStack>
          </XDSVStack>
        }
      >
        <XDSButton>Hover for interactive content</XDSButton>
      </XDSHoverCard>
    </div>
  ),
};

export const TextNode: Story = {
  render: () => (
    <div style={{ padding: 100 }}>
      <p>
        This feature was created by{' '}
        <XDSHoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </XDSHoverCard>{' '}
        and shipped last week.
      </p>
    </div>
  ),
};

export const TextNodeMultiple: Story = {
  render: () => (
    <div style={{ padding: 100 }}>
      <p>
        The project is maintained by{' '}
        <XDSHoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </XDSHoverCard>
        ,{' '}
        <XDSHoverCard
          content={
            <div style={{ width: 200 }}>
              <XDSVStack gap="space2">
                <div style={{ fontWeight: 600 }}>John Smith</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>Product Manager</div>
              </XDSVStack>
            </div>
          }
          placement="above"
        >
          John Smith
        </XDSHoverCard>
        , and others.
      </p>
    </div>
  ),
};
