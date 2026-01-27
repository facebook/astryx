import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSSection, XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent, XDSLayoutFooter, XDSLayoutPanel} from '@xds/core/Layout';
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

const meta: Meta<typeof XDSSection> = {
  title: 'Layout/XDSSection',
  component: XDSSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div {...stylex.props(styles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['section', 'transparent', 'wash'],
      description: 'Visual variant of the section',
    },
    width: {
      control: {type: 'range', min: 100, max: 800, step: 10},
      description: 'Width in pixels',
    },
    height: {
      control: {type: 'range', min: 100, max: 600, step: 10},
      description: 'Height in pixels',
    },
    isFullBleed: {
      control: 'boolean',
      description: 'Removes internal padding',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSection>;

export const Default: Story = {
  args: {
    variant: 'section',
    width: 300,
  },
  render: (args) => (
    <XDSSection {...args}>
      <p {...stylex.props(styles.text)}>
        A section with default padding. Sections are used to define
        distinct areas within a page.
      </p>
    </XDSSection>
  ),
};

export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>section (default)</h4>
        <XDSSection variant="section" width={200}>
          <p {...stylex.props(styles.text)}>Surface background</p>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>wash</h4>
        <XDSSection variant="wash" width={200}>
          <p {...stylex.props(styles.text)}>Wash background</p>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>transparent</h4>
        <XDSSection variant="transparent" width={200}>
          <p {...stylex.props(styles.text)}>Transparent background</p>
        </XDSSection>
      </div>
    </div>
  ),
};

export const WithSimpleContent: Story = {
  render: () => (
    <XDSSection variant="wash" width={320}>
      <XDSVStack gap="space2">
        <h3 {...stylex.props(styles.text)}>Section Title</h3>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This section contains simple content without XDSLayout.
          The container padding is applied automatically.
        </p>
      </XDSVStack>
    </XDSSection>
  ),
};

export const WithInnerLayout: Story = {
  render: () => (
    <XDSSection variant="wash" width={350} height={250}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <h3 {...stylex.props(styles.text)}>Section with Layout</h3>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p {...stylex.props(styles.text, styles.textSecondary)}>
              When using XDSLayout, the layout manages its own padding
              independently from the container padding.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap="space2" hAlign="end">
              <XDSButton variant="primary">Action</XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSSection>
  ),
};

export const PageLayout: Story = {
  render: () => (
    <XDSSection variant="section" width={600} height={300}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSVStack gap="space2">
              <h2 {...stylex.props(styles.text)}>Page Header</h2>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                Welcome to the application
              </p>
            </XDSVStack>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider width={150}>
            <h3 {...stylex.props(styles.text)}>Sidebar</h3>
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap="space2">
              <h3 {...stylex.props(styles.text)}>Main Content</h3>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                This demonstrates how XDSLayout can be used to create
                page layouts with header, sidebar, and content areas.
              </p>
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSSection>
  ),
};

export const FullBleed: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Default (with padding)</h4>
        <XDSSection variant="wash" width={250}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content with section padding</p>
          </div>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <XDSSection variant="wash" width={250} isFullBleed>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content touches section edges</p>
          </div>
        </XDSSection>
      </div>
    </div>
  ),
};
