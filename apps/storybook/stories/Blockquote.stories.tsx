// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  pullQuote: {
    fontSize: typeScaleVars['--text-large-size'],
    lineHeight: typeScaleVars['--text-large-leading'],
    marginBlock: spacingVars['--spacing-4'],
  },
  narrow: {
    maxWidth: '280px',
  },
});

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

export const PullQuoteWithXstyle: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Text type="body">
            xstyle carries layout and type overrides onto the blockquote itself,
            with no wrapper element.
          </Text>
          <Blockquote cite="Alan Kay" xstyle={styles.pullQuote}>
            The best way to predict the future is to invent it.
          </Blockquote>
        </VStack>
      </Card>
    </Section>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Section variant="muted">
      <Card>
        <VStack gap={3}>
          <Blockquote cite="A source with a notably long attribution line that has to wrap">
            A long quotation that runs past a single line, so the rule on the
            inline-start edge and the wrapped text stay aligned all the way
            down. Long attributions wrap the same way underneath.
          </Blockquote>
          <Blockquote>
            An unbroken token such as
            https://www.example.com/research/2026/design-systems/the-very-long-report-slug/appendix
            wraps instead of overflowing.
          </Blockquote>
        </VStack>
      </Card>
    </Section>
  ),
};

export const NarrowContainer: Story = {
  render: () => (
    <Section variant="muted">
      <Card xstyle={styles.narrow}>
        <Blockquote cite="Steve Jobs">
          Design is not just what it looks like and feels like. Design is how it
          works.
        </Blockquote>
      </Card>
    </Section>
  ),
};
