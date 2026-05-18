// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSBlockquote} from '@xds/core/Blockquote';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSBlockquote> = {
  title: 'Core/Blockquote',
  component: XDSBlockquote,
  tags: ['autodocs'],
  argTypes: {
    cite: {
      control: 'text',
      description: 'Optional attribution for the quote',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBlockquote>;

export const Default: Story = {
  args: {
    children:
      'Design is not just what it looks like and feels like. Design is how it works.',
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSBlockquote {...args} />
      </XDSCard>
    </XDSSection>
  ),
};

export const WithCitation: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSBlockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </XDSBlockquote>
      </XDSCard>
    </XDSSection>
  ),
};

export const InContent: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="body">
            In a 2003 interview, the importance of design thinking was
            emphasized:
          </XDSText>
          <XDSBlockquote cite="Steve Jobs">
            Design is not just what it looks like and feels like. Design is how
            it works.
          </XDSBlockquote>
          <XDSText type="body">
            This philosophy has guided product development for decades.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSBlockquote>
          <XDSText type="body">
            The best way to predict the future is to invent it.
          </XDSText>
          <XDSText type="supporting">From a talk at PARC in 1971.</XDSText>
        </XDSBlockquote>
      </XDSCard>
    </XDSSection>
  ),
};

export const MultipleParagraphs: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSBlockquote cite="Alan Kay">
          <XDSVStack gap={2}>
            <XDSText type="body">
              The best way to predict the future is to invent it.
            </XDSText>
            <XDSText type="body">
              People who are really serious about software should make their own
              hardware.
            </XDSText>
          </XDSVStack>
        </XDSBlockquote>
      </XDSCard>
    </XDSSection>
  ),
};
