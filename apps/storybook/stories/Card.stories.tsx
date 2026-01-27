import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard, XDSSection, XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent, XDSLayoutFooter} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {colorVars, spacingVars, typographyVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
  text: {
    fontFamily: typographyVars['--font-body'],
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
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    color: colorVars['--color-text-secondary'],
  },
});

const meta: Meta<typeof XDSCard> = {
  title: 'Layout/XDSCard',
  component: XDSCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
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
    isFullBleed: {
      control: 'boolean',
      description: 'Removes internal padding',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCard>;

export const Default: Story = {
  args: {
    width: 300,
  },
  render: (args) => (
    <XDSCard {...args}>
      <p {...stylex.props(styles.text)}>
        Simple content inside a card. The card provides default padding via
        the --container-padding CSS variable.
      </p>
    </XDSCard>
  ),
};

export const WithSimpleContent: Story = {
  render: () => (
    <XDSCard width={320}>
      <XDSVStack gap="space2">
        <h3 {...stylex.props(styles.text)}>Card Title</h3>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This card contains simple content without XDSLayout.
          The container padding is applied automatically.
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
            <h3 {...stylex.props(styles.text)}>Card with Layout</h3>
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
            <XDSHStack gap="space2" hAlign="end">
              <XDSButton variant="secondary">Cancel</XDSButton>
              <XDSButton variant="primary">Save</XDSButton>
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
            <h3 {...stylex.props(styles.text)}>Fixed Height Card</h3>
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
      <XDSVStack gap="space3">
        <h3 {...stylex.props(styles.text)}>Parent Card</h3>
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
        <XDSVStack gap="space2">
          <h3 {...stylex.props(styles.text)}>First Section</h3>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on top and sides because
            it's the first child.
          </p>
        </XDSVStack>
      </XDSSection>
      <XDSSection variant="transparent" dividers={['bottom']}>
        <XDSVStack gap="space2">
          <h3 {...stylex.props(styles.text)}>Middle Section</h3>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            Middle sections only escape horizontal padding, maintaining
            visual separation from adjacent sections.
          </p>
        </XDSVStack>
      </XDSSection>
      <XDSSection variant="transparent">
        <XDSVStack gap="space2">
          <h3 {...stylex.props(styles.text)}>Last Section</h3>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            This section escapes the card padding on bottom and sides
            because it's the last child.
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
        <XDSVStack gap="space2">
          <h3 {...stylex.props(styles.text)}>Only Section (Full Bleed All Sides)</h3>
          <p {...stylex.props(styles.text, styles.textSecondary)}>
            When a section is both first and last child, it gets full bleed
            on all four sides, completely filling the card.
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
          <XDSVStack gap="space2">
            <h3 {...stylex.props(styles.text)}>Card Title</h3>
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
            <XDSVStack gap="space2">
              <h3 {...stylex.props(styles.text)}>Card Title</h3>
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
        <XDSCard width={250} isFullBleed>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content touches card edges</p>
          </div>
        </XDSCard>
      </div>
    </div>
  ),
};
