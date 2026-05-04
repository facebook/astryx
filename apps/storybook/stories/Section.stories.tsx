import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  surfaceWrapper: {
    backgroundColor: colorVars['--color-background-surface'],
    padding: spacingVars['--spacing-6'],
  },
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

const meta: Meta<typeof XDSSection> = {
  title: 'Core/Section',
  component: XDSSection,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(styles.surfaceWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['section', 'transparent', 'muted'],
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
  },
};

export default meta;
type Story = StoryObj<typeof XDSSection>;

export const Default: Story = {
  args: {
    variant: 'section',
    width: 300,
  },
  render: args => (
    <XDSSection {...args}>
      <p {...stylex.props(styles.text)}>
        A section with default padding. Sections are used to define distinct
        areas within a page.
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
        <h4 {...stylex.props(styles.heading)}>muted</h4>
        <XDSSection variant="muted" width={200}>
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
    <XDSSection variant="muted" width={320}>
      <XDSVStack gap={2}>
        <h3 {...stylex.props(styles.text)}>Section Title</h3>
        <p {...stylex.props(styles.text, styles.textSecondary)}>
          This section contains simple content without XDSLayout. The container
          padding is applied automatically.
        </p>
      </XDSVStack>
    </XDSSection>
  ),
};

export const WithInnerLayout: Story = {
  render: () => (
    <XDSSection variant="muted" width={350} height={250}>
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
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Action" variant="primary">
                Action
              </XDSButton>
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
            <XDSVStack gap={2}>
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
            <XDSVStack gap={2}>
              <h3 {...stylex.props(styles.text)}>Main Content</h3>
              <p {...stylex.props(styles.text, styles.textSecondary)}>
                This demonstrates how XDSLayout can be used to create page
                layouts with header, sidebar, and content areas.
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
        <XDSSection variant="muted" width={250}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content with section padding</p>
          </div>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Full Bleed (no padding)</h4>
        <XDSSection variant="muted" width={250} padding={0}>
          <div style={{backgroundColor: 'rgba(0,100,200,0.2)', padding: 8}}>
            <p {...stylex.props(styles.text)}>Content touches section edges</p>
          </div>
        </XDSSection>
      </div>
    </div>
  ),
};

export const NestedPaddingInheritance: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          padding=6 → nested (inherits 6)
        </h4>
        <XDSSection variant="section" width={350} padding={6}>
          <XDSSection variant="muted">
            <p {...stylex.props(styles.text)}>
              Inner section inherits padding=6 from parent. Edge compensation
              and content inset should both use 24px.
            </p>
          </XDSSection>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>padding=6 → nested padding=2</h4>
        <XDSSection variant="section" width={350} padding={6}>
          <XDSSection variant="muted" padding={2}>
            <p {...stylex.props(styles.text)}>
              Inner section explicitly sets padding=2, overriding the parent's
              padding=6. Content inset is 8px.
            </p>
          </XDSSection>
        </XDSSection>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          padding=2 → nested (inherits 2)
        </h4>
        <XDSSection variant="section" width={350} padding={2}>
          <XDSSection variant="muted">
            <p {...stylex.props(styles.text)}>
              Inner section inherits padding=2 from parent. Both edge
              compensation and content inset use 8px.
            </p>
          </XDSSection>
        </XDSSection>
      </div>
    </div>
  ),
};
