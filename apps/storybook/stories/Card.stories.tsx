import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading} from '@xds/core/Text';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

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

const meta: Meta<typeof XDSCard> = {
  title: 'Layout/XDSCard',
  component: XDSCard,
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
type Story = StoryObj<typeof XDSCard>;

export const Default: Story = {
  args: {
    width: 300,
  },
  render: args => (
    <XDSCard {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via the
        --container-padding CSS variable.
      </p>
    </XDSCard>
  ),
};

export const WithSimpleContent: Story = {
  render: () => (
    <XDSCard width={320}>
      <XDSVStack gap={2}>
        <XDSHeading level={3}>Card Title</XDSHeading>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without XDSLayout. The container
          padding is applied automatically.
        </p>
      </XDSVStack>
    </XDSCard>
  ),
};

export const WithInnerLayout: Story = {
  render: () => (
    <XDSCard width={350}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={3}>Card with Layout</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using XDSLayout, the layout uses negative margin to escape
              the container padding, then manages its own padding.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Cancel" variant="secondary">
                Cancel
              </XDSButton>
              <XDSButton label="Save" variant="primary">
                Save
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Small (200px)</h4>
        <XDSCard width={200}>
          <p {...stylex.props(styles.text)}>Small card</p>
        </XDSCard>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Medium (300px)</h4>
        <XDSCard width={300}>
          <p {...stylex.props(styles.text)}>Medium card</p>
        </XDSCard>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Large (400px)</h4>
        <XDSCard width={400}>
          <p {...stylex.props(styles.text)}>Large card</p>
        </XDSCard>
      </div>
    </div>
  ),
};

export const FixedHeight: Story = {
  render: () => (
    <XDSCard width={300} height={200}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={3}>Fixed Height Card</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              This card has a fixed height. Content area will scroll if needed.
            </p>
          </XDSLayoutContent>
        }
      />
    </XDSCard>
  ),
};

export const NestedCards: Story = {
  render: () => (
    <XDSCard width={400}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Parent Card</XDSHeading>
        <XDSCard width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Nested card resets --container-padding and gets its own padding.
          </p>
        </XDSCard>
        <XDSCard width="100%">
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Another nested card with independent padding.
          </p>
        </XDSCard>
      </XDSVStack>
    </XDSCard>
  ),
};

export const NestedSections: Story = {
  render: () => (
    <XDSCard width={400}>
      <XDSSection variant="transparent" dividers={['bottom']}>
        <XDSVStack gap={2}>
          <XDSHeading level={3}>First Section</XDSHeading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on top and sides because it's
            the first child.
          </p>
        </XDSVStack>
      </XDSSection>
      <XDSSection variant="transparent" dividers={['bottom']}>
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Middle Section</XDSHeading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Middle sections only escape horizontal padding, maintaining visual
            separation from adjacent sections.
          </p>
        </XDSVStack>
      </XDSSection>
      <XDSSection variant="transparent">
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Last Section</XDSHeading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on bottom and sides because
            it's the last child.
          </p>
        </XDSVStack>
      </XDSSection>
    </XDSCard>
  ),
};

export const SingleSection: Story = {
  render: () => (
    <XDSCard width={350}>
      <XDSSection variant="wash">
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Only Section (Full Bleed All Sides)</XDSHeading>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            When a section is both first and last child, it gets full bleed on
            all four sides, completely filling the card.
          </p>
        </XDSVStack>
      </XDSSection>
    </XDSCard>
  ),
};

export const MixedContent: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Simple Content</h4>
        <XDSCard width={250}>
          <XDSVStack gap={2}>
            <XDSHeading level={3}>Card Title</XDSHeading>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              Regular content uses the card's container padding.
            </p>
          </XDSVStack>
        </XDSCard>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>With Section</h4>
        <XDSCard width={250}>
          <XDSSection variant="wash">
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Card Title</XDSHeading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Section content bleeds to the card edges.
              </p>
            </XDSVStack>
          </XDSSection>
        </XDSCard>
      </div>
    </div>
  ),
};

export const FullBleed: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Default (with padding)</h4>
        <XDSCard width={250}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content with card padding</p>
          </div>
        </XDSCard>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <XDSCard width={250} padding={0}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content touches card edges</p>
          </div>
        </XDSCard>
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
          <XDSCard width={250}>
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Card on Wash</XDSHeading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Cards stand out clearly against the wash background, creating a
                layered visual hierarchy.
              </p>
            </XDSVStack>
          </XDSCard>
          <XDSCard width={250}>
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Another Card</XDSHeading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Multiple cards on wash create a dashboard-like layout.
              </p>
            </XDSVStack>
          </XDSCard>
        </div>
      </div>
      <XDSSection variant="section" width="100%">
        <h4 {...stylex.props(styles.heading)}>Cards on surface section</h4>
        <div {...stylex.props(styles.storyWrapper)}>
          <XDSCard width={250}>
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Card on Surface</XDSHeading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                On a surface background, cards are more subtle since both share
                the same base color.
              </p>
            </XDSVStack>
          </XDSCard>
          <XDSCard width={250}>
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Another Card</XDSHeading>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                The card border provides separation from the surface.
              </p>
            </XDSVStack>
          </XDSCard>
        </div>
      </XDSSection>
    </div>
  ),
};

/**
 * Callout card: a card with a wash section used as a callout/highlight area.
 * This pattern pairs XDSCard with a wash XDSSection for visual emphasis.
 */
export const Callout: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <XDSCard width={350}>
        <XDSSection variant="wash">
          <XDSVStack gap={2}>
            <XDSHeading level={3}>💡 Tip</XDSHeading>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              Use a wash section inside a card for callouts, tips, or
              highlighted information. The wash background provides visual
              contrast against the card surface.
            </p>
          </XDSVStack>
        </XDSSection>
      </XDSCard>
      <XDSCard width={350}>
        <XDSSection variant="wash">
          <XDSVStack gap={2}>
            <XDSHeading level={3}>⚠️ Warning</XDSHeading>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              Callout cards work well for alerts and warnings too. The full
              bleed wash fills the card edge-to-edge.
            </p>
          </XDSVStack>
        </XDSSection>
      </XDSCard>
    </div>
  ),
};
