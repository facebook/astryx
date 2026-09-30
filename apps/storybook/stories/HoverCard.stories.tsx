// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, waitFor} from 'storybook/test';
import {HoverCard, useHoverCard} from '@astryxdesign/core/HoverCard';
import {Button} from '@astryxdesign/core/Button';
import {VStack, HStack} from '@astryxdesign/core/Layout';

const meta: Meta<typeof HoverCard> = {
  title: 'Core/HoverCard',
  component: HoverCard,
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
    touchTrigger: {
      control: 'select',
      options: ['auto', 'tap', 'none'],
      description:
        'What a tap does where there is no hover: auto (tap unless the trigger acts), tap, or none',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

// Sample content for hover cards
function ProfileCard() {
  return (
    <div style={{width: 200}}>
      <VStack gap={2}>
        <div style={{fontWeight: 600}}>Jane Doe</div>
        <div style={{fontSize: 14, opacity: 0.7}}>Software Engineer</div>
        <div style={{fontSize: 13}}>
          Building great products with great people.
        </div>
      </VStack>
    </div>
  );
}

export const Default: Story = {
  args: {
    placement: 'above',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const Below: Story = {
  args: {
    placement: 'below',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const Start: Story = {
  args: {
    placement: 'start',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const End: Story = {
  args: {
    placement: 'end',
    content: <ProfileCard />,
    children: <Button label="Hover me">Hover me</Button>,
  },
};

export const CustomDelay: Story = {
  args: {
    placement: 'above',
    delay: 500,
    hideDelay: 300,
    content: <ProfileCard />,
    children: <Button label="Slow hover (500ms)">Slow hover (500ms)</Button>,
  },
};

export const Disabled: Story = {
  args: {
    placement: 'above',
    isEnabled: false,
    content: <ProfileCard />,
    children: <Button label="Hover disabled">Hover disabled</Button>,
  },
};

export const AllPlacements: Story = {
  render: () => (
    <div style={{padding: 100, display: 'flex', gap: 24, flexWrap: 'wrap'}}>
      <HoverCard content={<ProfileCard />} placement="above">
        <Button label="Above">Above</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="below">
        <Button label="Below">Below</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="start">
        <Button label="Start">Start</Button>
      </HoverCard>
      <HoverCard content={<ProfileCard />} placement="end">
        <Button label="End">End</Button>
      </HoverCard>
    </div>
  ),
};

export const ViewportFallbackControls: Story = {
  name: 'Viewport fallback controls',
  parameters: {layout: 'fullscreen'},
  render: () => (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        insetInlineEnd: 16,
        insetBlockStart: 100,
        writingMode: 'vertical-rl',
      }}>
      <HoverCard
        label="Profile details"
        placement="below"
        alignment="start"
        delay={0}
        hideDelay={120}
        focusTrigger="always"
        content={<ProfileCard />}>
        <Button label="Profile fallback target">Profile fallback target</Button>
      </HoverCard>
    </div>
  ),
  play: async ({canvasElement}) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('button');
    if (trigger == null) {
      throw new Error('HoverCard fallback trigger did not render');
    }
    await userEvent.hover(trigger);
    const card = await waitFor(() => {
      const found = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-label="Profile details"]',
      );
      expect(found).not.toBeNull();
      return found;
    });
    if (card == null) {
      throw new Error('HoverCard fallback content did not render');
    }
    const layer = card.closest<HTMLElement>('[popover]');
    if (layer == null) {
      throw new Error('HoverCard fallback layer did not render');
    }
    const rect = layer.getBoundingClientRect();
    // offsetWidth ignores the entry transform while still proving the intrinsic
    // 200px content width was not narrowed by positioning.
    expect(layer.offsetWidth).toBeGreaterThanOrEqual(199);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);

    await userEvent.hover(layer);
    await new Promise(resolve => setTimeout(resolve, 160));
    expect(layer.matches(':popover-open')).toBe(true);

    trigger.focus();
    await userEvent.unhover(layer);
    await new Promise(resolve => setTimeout(resolve, 160));
    expect(layer.matches(':popover-open')).toBe(true);
  },
};

export const WithHook: Story = {
  render: function HookExample() {
    const hoverCard = useHoverCard({
      placement: 'above',
      delay: 200,
    });

    return (
      <div style={{padding: 100}}>
        <Button
          label="Using hook directly"
          ref={hoverCard.ref}
          aria-describedby={hoverCard.describedBy}>
          Using hook directly
        </Button>
        {hoverCard.renderHoverCard(<ProfileCard />)}
      </div>
    );
  },
};

export const InteractiveContent: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <HoverCard
        placement="below"
        content={
          <VStack gap={2}>
            <div>Interactive hover card content</div>
            <HStack gap={2}>
              <Button label="Follow" variant="primary">
                Follow
              </Button>
              <Button label="Message">Message</Button>
            </HStack>
          </VStack>
        }>
        <Button label="Hover for interactive content">
          Hover for interactive content
        </Button>
      </HoverCard>
    </div>
  ),
};

export const TextNode: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <p>
        This feature was created by{' '}
        <HoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </HoverCard>{' '}
        and shipped last week.
      </p>
    </div>
  ),
};

export const TextNodeMultiple: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <p>
        The project is maintained by{' '}
        <HoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </HoverCard>
        ,{' '}
        <HoverCard
          content={
            <div style={{width: 200}}>
              <VStack gap={2}>
                <div style={{fontWeight: 600}}>John Smith</div>
                <div style={{fontSize: 14, opacity: 0.7}}>Product Manager</div>
              </VStack>
            </div>
          }
          placement="above">
          John Smith
        </HoverCard>
        , and others.
      </p>
    </div>
  ),
};

/**
 * Touch has no hover, so a tap decides instead. A tap-opened card is dismissed
 * by a tap outside it, and a tap on the card's own content leaves it open.
 */
export const TouchTriggers: Story = {
  render: () => (
    <div style={{padding: 100}}>
      <HStack gap={4}>
        {/* Acts on tap: the tap belongs to the button, so no card. */}
        <HoverCard content={<ProfileCard />} placement="above">
          <Button label="Open profile">Open profile</Button>
        </HoverCard>
        {/* Does nothing on tap: the tap opens the card. */}
        <HoverCard content={<ProfileCard />} placement="above">
          Jane Doe
        </HoverCard>
      </HStack>
    </div>
  ),
};
