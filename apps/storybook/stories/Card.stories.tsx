// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {
  VStack,
  HStack,
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Text';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
  },
  text: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
    margin: 0,
  },
  textSecondary: {
    color: colorVars['--color-text-secondary'],
    fontSize: 14,
  },
  storyWrapper: {
    display: 'flex',
    gap: spacingVars['--spacing-6'],
    flexWrap: 'wrap',
  },
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 14,
    color: colorVars['--color-text-secondary'],
  },
});

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    width: {
      control: {type: 'range', min: 100, max: 800, step: 10},
      description: 'Width in pixels',
    },
    height: {
      control: {type: 'range', min: 100, max: 600, step: 10},
      description: 'Height in pixels',
    },
    maxWidth: {
      control: {type: 'range', min: 100, max: 800, step: 10},
      description: 'Maximum width in pixels',
    },
    minHeight: {
      control: {type: 'range', min: 100, max: 600, step: 10},
      description: 'Minimum height in pixels',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    width: 300,
  },
  render: args => (
    <Card {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via the
        --container-padding CSS variable.
      </p>
    </Card>
  ),
};

export const WithSimpleContent: Story = {
  render: () => (
    <Card width={320}>
      <VStack gap={2}>
        <Heading level={3}>Card Title</Heading>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without Layout. The container
          padding is applied automatically.
        </p>
      </VStack>
    </Card>
  ),
};

export const WithInnerLayout: Story = {
  render: () => (
    <Card width={350}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={3}>Card with Layout</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using Layout, the layout uses negative margin to escape the
              container padding, then manages its own padding.
            </p>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Cancel" variant="secondary">
                Cancel
              </Button>
              <Button label="Save" variant="primary">
                Save
              </Button>
            </HStack>
          </LayoutFooter>
        }
      />
    </Card>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Small (200px)</h4>
        <Card width={200}>
          <p {...stylex.props(styles.text)}>Small card</p>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Medium (300px)</h4>
        <Card width={300}>
          <p {...stylex.props(styles.text)}>Medium card</p>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Large (400px)</h4>
        <Card width={400}>
          <p {...stylex.props(styles.text)}>Large card</p>
        </Card>
      </div>
    </div>
  ),
};

export const FixedHeight: Story = {
  render: () => (
    <Card width={300} height={200}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={3}>Fixed Height Card</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              This card has a fixed height. Content area will scroll if needed.
            </p>
          </LayoutContent>
        }
      />
    </Card>
  ),
};

export const NestedCards: Story = {
  render: () => (
    <Card width={400}>
      <VStack gap={3}>
        <Heading level={3}>Parent Card</Heading>
        <Card width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Nested card resets --container-padding and gets its own padding.
          </p>
        </Card>
        <Card width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Another nested card with independent padding.
          </p>
        </Card>
      </VStack>
    </Card>
  ),
};

export const NestedSections: Story = {
  render: () => (
    <Card width={400}>
      <Section variant="transparent" dividers={['bottom']}>
        <VStack gap={2}>
          <Heading level={3}>First Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on top and sides because it's
            the first child.
          </p>
        </VStack>
      </Section>
      <Section variant="transparent" dividers={['bottom']}>
        <VStack gap={2}>
          <Heading level={3}>Middle Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Middle sections only escape horizontal padding, maintaining visual
            separation from adjacent sections.
          </p>
        </VStack>
      </Section>
      <Section variant="transparent">
        <VStack gap={2}>
          <Heading level={3}>Last Section</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on bottom and sides because
            it's the last child.
          </p>
        </VStack>
      </Section>
    </Card>
  ),
};

export const SingleSection: Story = {
  render: () => (
    <Card width={350}>
      <Section variant="muted">
        <VStack gap={2}>
          <Heading level={3}>Only Section (Full Bleed All Sides)</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            When a section is both first and last child, it gets full bleed on
            all four sides, completely filling the card.
          </p>
        </VStack>
      </Section>
    </Card>
  ),
};

export const MixedContent: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Simple Content</h4>
        <Card width={250}>
          <VStack gap={2}>
            <Heading level={3}>Card Title</Heading>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              Regular content uses the card's container padding.
            </p>
          </VStack>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>With Section</h4>
        <Card width={250}>
          <Section variant="muted">
            <VStack gap={2}>
              <Heading level={3}>Card Title</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Section content bleeds to the card edges.
              </p>
            </VStack>
          </Section>
        </Card>
      </div>
    </div>
  ),
};

export const FullBleed: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Default (with padding)</h4>
        <Card width={250}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content with card padding</p>
          </div>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <Card width={250} padding={0}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content touches card edges</p>
          </div>
        </Card>
      </div>
    </div>
  ),
};

/**
 * Cards shown on top of different background treatments.
 * Demonstrates the visual contrast between cards on wash (gray)
 * backgrounds vs surface (white) backgrounds.
 */
export const OnBackgrounds: Story = {
  decorators: [Story => <Story />],
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
      <div {...stylex.props(styles.pageWrapper)}>
        <h4 {...stylex.props(styles.heading)}>Cards on wash background</h4>
        <div {...stylex.props(styles.storyWrapper)}>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Card on Wash</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Cards stand out clearly against the wash background, creating a
                layered visual hierarchy.
              </p>
            </VStack>
          </Card>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Another Card</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Multiple cards on wash create a dashboard-like layout.
              </p>
            </VStack>
          </Card>
        </div>
      </div>
      <Section variant="section" width="100%">
        <h4 {...stylex.props(styles.heading)}>Cards on surface section</h4>
        <div {...stylex.props(styles.storyWrapper)}>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Card on Surface</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                On a surface background, cards are more subtle since both share
                the same base color.
              </p>
            </VStack>
          </Card>
          <Card width={250}>
            <VStack gap={2}>
              <Heading level={3}>Another Card</Heading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                The card border provides separation from the surface.
              </p>
            </VStack>
          </Card>
        </div>
      </Section>
    </div>
  ),
};

/**
 * Elevated cards: the `elevation` prop maps to the shadow token scale
 * (`--shadow-low` / `--shadow-med` / `--shadow-high`). Elevated cards drop
 * the default variant's border — the shadow replaces it as the separation
 * cue, matching the system's other elevated surfaces (Popover, Dialog).
 */
export const Elevated: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <Card width={250} elevation="low">
        <VStack gap={2}>
          <Heading level={3}>Low</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Subtle lift for resting surfaces like dashboard widgets.
          </p>
        </VStack>
      </Card>
      <Card width={250} elevation="med">
        <VStack gap={2}>
          <Heading level={3}>Med</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Clear separation for panels that float above the page.
          </p>
        </VStack>
      </Card>
      <Card width={250} elevation="high">
        <VStack gap={2}>
          <Heading level={3}>High</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Strong float for cards over photos or colored backgrounds.
          </p>
        </VStack>
      </Card>
    </div>
  ),
};

/**
 * Callout card: a muted card used as a callout/highlight area.
 * Uses `variant="muted"` directly on Card instead of wrapping content
 * in a wash section — simpler and semantically cleaner.
 */
export const Callout: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <Card width={350} variant="muted">
        <VStack gap={2}>
          <Heading level={3}>💡 Tip</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Use <code>variant="muted"</code> for callouts, tips, or highlighted
            information. The muted background provides visual contrast without
            needing a nested section.
          </p>
        </VStack>
      </Card>
      <Card width={350} variant="muted">
        <VStack gap={2}>
          <Heading level={3}>⚠️ Warning</Heading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Muted cards work well for alerts and warnings too.
          </p>
        </VStack>
      </Card>
    </div>
  ),
};

/**
 * All background color variants in one view.
 * `muted` uses the wash background for de-emphasised cards;
 * the non-semantic variants use the `--color-<name>-background` token.
 */
export const ColorVariants: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      {(
        [
          'default',
          'muted',
          'blue',
          'cyan',
          'gray',
          'green',
          'orange',
          'pink',
          'purple',
          'red',
          'teal',
          'yellow',
        ] as const
      ).map(variant => (
        <div key={variant}>
          <h4 {...stylex.props(styles.heading)}>{variant}</h4>
          <Card width={160} variant={variant}>
            <p {...stylex.props(styles.text)}>{variant}</p>
          </Card>
        </div>
      ))}
    </div>
  ),
};
