import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  fullHeight: {
    height: '100%',
  },
});

const meta: Meta<typeof XDSDivider> = {
  title: 'Core/Divider',
  component: XDSDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider',
    },
    variant: {
      control: 'select',
      options: ['subtle', 'strong'],
      description: 'Visual weight of the divider line',
    },
    isFullBleed: {
      control: 'boolean',
      description: 'Escape parent container padding',
    },
    label: {
      control: 'text',
      description: 'Optional label text (rendered small and secondary)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSDivider>;

export const Default: Story = {
  args: {},
  render: args => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="body">Content above</XDSText>
          <XDSDivider {...args} />
          <XDSText type="body">Content below</XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const WithLabel: Story = {
  args: {
    label: 'or',
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="body">Content above</XDSText>
          <XDSDivider {...args} />
          <XDSText type="body">Content below</XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const Variants: Story = {
  render: () => (
    <XDSSection variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSText type="supporting">Subtle (default)</XDSText>
            <XDSDivider variant="subtle" />
          </XDSVStack>
        </XDSCard>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSText type="supporting">Strong</XDSText>
            <XDSDivider variant="strong" />
          </XDSVStack>
        </XDSCard>
      </div>
    </XDSSection>
  ),
};

export const FullBleed: Story = {
  render: () => (
    <XDSSection variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSText type="label">Normal divider</XDSText>
            <XDSText type="body">
              The divider respects container padding.
            </XDSText>
            <XDSDivider />
            <XDSText type="body">Content below the divider.</XDSText>
          </XDSVStack>
        </XDSCard>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSText type="label">Full bleed divider</XDSText>
            <XDSText type="body">
              The divider extends to container edges.
            </XDSText>
            <XDSDivider isFullBleed />
            <XDSText type="body">Content below the divider.</XDSText>
          </XDSVStack>
        </XDSCard>
      </div>
    </XDSSection>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard height={200}>
        <XDSHStack gap={4} xstyle={styles.fullHeight}>
          <XDSText type="body">Left content</XDSText>
          <XDSDivider {...args} />
          <XDSText type="body">Right content</XDSText>
        </XDSHStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const VerticalWithLabel: Story = {
  args: {
    orientation: 'vertical',
    label: 'OR',
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard height={200}>
        <XDSHStack gap={4} xstyle={styles.fullHeight}>
          <XDSText type="body">Option A</XDSText>
          <XDSDivider {...args} />
          <XDSText type="body">Option B</XDSText>
        </XDSHStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const InCard: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Card Title</XDSText>
          <XDSDivider />
          <XDSText type="body">
            This demonstrates how a divider can be used to separate content
            sections within a card or panel.
          </XDSText>
          <XDSDivider label="More Info" />
          <XDSText type="supporting">
            Additional details can appear below a labeled divider.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  ),
};

export const FullBleedVertical: Story = {
  render: () => (
    <XDSSection variant="muted">
      <XDSCard height={200}>
        <XDSHStack gap={4} xstyle={styles.fullHeight}>
          <XDSText type="body">Left content</XDSText>
          <XDSDivider orientation="vertical" isFullBleed />
          <XDSText type="body">Right content</XDSText>
        </XDSHStack>
      </XDSCard>
    </XDSSection>
  ),
};
