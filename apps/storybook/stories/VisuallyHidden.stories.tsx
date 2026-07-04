// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Core/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content exposed to assistive technology while hidden',
    },
    as: {
      control: 'text',
      description: "HTML tag to render as (default 'span')",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  args: {
    children: 'This text is only announced to screen readers',
  },
  render: args => (
    <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            There is visually-hidden text below this line. Inspect the DOM or
            use a screen reader to perceive it.
          </Text>
          <VisuallyHidden {...args} />
          <Text type="body" color="secondary">
            (nothing visible renders between the two paragraphs)
          </Text>
        </VStack>
      </Card>
    </Section>
  ),
};

export const SupplementaryContext: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <VStack gap={2} align="start">
          <Text type="body">
            Read more{' '}
            <a href="https://example.com">
              here
              <VisuallyHidden> about accessibility primitives</VisuallyHidden>
            </a>
          </Text>
          <Text type="body" color="secondary">
            The link is announced as “here about accessibility primitives”, so
            it is not an ambiguous “here” out of context.
          </Text>
        </VStack>
      </Card>
    </Section>
  ),
};

export const LiveRegion: Story = {
  render: () => <LiveRegionDemo />,
};

function LiveRegionDemo() {
  const [count, setCount] = useState(0);
  return (
    <Section variant="muted">
      <Card>
        <VStack gap={3} align="start">
          <Text type="body">
            Activating the button updates a polite live region that a screen
            reader announces.
          </Text>
          <Button label="Add item" onClick={() => setCount(c => c + 1)} />
          <Text type="body" color="secondary">
            Items added: {count}
          </Text>
          <VisuallyHidden as="div" role="status" aria-live="polite">
            {count > 0 ? `${count} item${count === 1 ? '' : 's'} added` : ''}
          </VisuallyHidden>
        </VStack>
      </Card>
    </Section>
  );
}
