// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Blockquote} from '@xds/core/Blockquote';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const meta: Meta<typeof Blockquote> = {
  title: 'Core/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  argTypes: {
    cite: {
      control: 'text',
      description: 'Optional attribution for the quote',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children:
      'Design is not just what it looks like and feels like. Design is how it works.',
  },
  render: args => (
    <Section variant="muted">
      <Card>
        <Blockquote {...args} />
      </Card>
    </Section>
  ),
};

export const WithCitation: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <Blockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </Blockquote>
      </Card>
    </Section>
  ),
};

export const InContent: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            In a 2003 interview, the importance of design thinking was
            emphasized:
          </Text>
          <Blockquote cite="Steve Jobs">
            Design is not just what it looks like and feels like. Design is how
            it works.
          </Blockquote>
          <Text type="body">
            This philosophy has guided product development for decades.
          </Text>
        </VStack>
      </Card>
    </Section>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <Blockquote>
          <Text type="body">
            The best way to predict the future is to invent it.
          </Text>
          <Text type="supporting">From a talk at PARC in 1971.</Text>
        </Blockquote>
      </Card>
    </Section>
  ),
};

export const MultipleParagraphs: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <Blockquote cite="Alan Kay">
          <VStack gap={2}>
            <Text type="body">
              The best way to predict the future is to invent it.
            </Text>
            <Text type="body">
              People who are really serious about software should make their own
              hardware.
            </Text>
          </VStack>
        </Blockquote>
      </Card>
    </Section>
  ),
};
