import type {Meta, StoryObj} from '@storybook/react';
import {XDSHeading} from '@xds/core/Text';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSHeading> = {
  title: 'Typography/XDSHeading',
  component: XDSHeading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Visual heading level (1-6)',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'disabled',
        'placeholder',
        'active',
        'inherit',
      ],
      description: 'Text color',
    },
    display: {
      control: 'select',
      options: ['inline', 'block'],
      description: 'Display mode',
    },
    maxLines: {
      control: 'number',
      description: 'Maximum lines before truncation (0 = no truncation)',
    },
    textWrap: {
      control: 'select',
      options: ['wrap', 'nowrap', 'balance', 'pretty'],
      description: 'Text wrapping behavior',
    },
    wordBreak: {
      control: 'select',
      options: ['break-word', 'break-all'],
      description: 'Word break behavior',
    },
    hasStrikethrough: {
      control: 'boolean',
      description: 'Apply strikethrough decoration',
    },
    hasCapsize: {
      control: 'boolean',
      description: 'Enable optical alignment (text-box-trim)',
    },
    accessibilityLevel: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Semantic level for accessibility (aria-level)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSHeading>;

// =============================================================================
// Heading Levels
// =============================================================================

export const Level1: Story = {
  args: {
    level: 1,
    children: 'Heading Level 1 (24px)',
  },
};

export const Level2: Story = {
  args: {
    level: 2,
    children: 'Heading Level 2 (20px)',
  },
};

export const Level3: Story = {
  args: {
    level: 3,
    children: 'Heading Level 3 (17px)',
  },
};

export const Level4: Story = {
  args: {
    level: 4,
    children: 'Heading Level 4 (14px — base)',
  },
};

export const Level5: Story = {
  args: {
    level: 5,
    children: 'Heading Level 5 (12px)',
  },
};

export const Level6: Story = {
  args: {
    level: 6,
    children: 'Heading Level 6 (10px)',
  },
};

// =============================================================================
// All Levels Overview
// =============================================================================

export const AllLevels: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <XDSText type="supporting" display="block">
        Type scale: base=14px, ratio=1.2, h4 anchored to base. Sizes are
        computed from the geometric progression: size = base × ratio^step
      </XDSText>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '8px',
        }}>
        <XDSHeading level={1}>Heading 1 — 24px</XDSHeading>
        <XDSHeading level={2}>Heading 2 — 20px</XDSHeading>
        <XDSHeading level={3}>Heading 3 — 17px</XDSHeading>
        <XDSHeading level={4}>Heading 4 — 14px (base)</XDSHeading>
        <XDSHeading level={5}>Heading 5 — 12px</XDSHeading>
        <XDSHeading level={6}>Heading 6 — 10px</XDSHeading>
      </div>
    </div>
  ),
};

// =============================================================================
// Color Variants
// =============================================================================

export const ColorVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSHeading level={2} color="primary">
        Primary heading (default)
      </XDSHeading>
      <XDSHeading level={2} color="secondary">
        Secondary heading
      </XDSHeading>
      <XDSHeading level={2} color="disabled">
        Disabled heading
      </XDSHeading>
      <XDSHeading level={2} color="placeholder">
        Placeholder heading
      </XDSHeading>
      <XDSHeading level={2} color="active">
        Active heading (accent)
      </XDSHeading>
      <div style={{color: 'purple'}}>
        <XDSHeading level={2} color="inherit">
          Inherit heading (from parent)
        </XDSHeading>
      </div>
    </div>
  ),
};

// =============================================================================
// Display Modes
// =============================================================================

export const DisplayModes: Story = {
  render: () => (
    <div>
      <div style={{marginBottom: '16px'}}>
        <XDSHeading level={3} display="inline">
          Inline H3{' '}
        </XDSHeading>
        <XDSHeading level={3} display="inline">
          flows together{' '}
        </XDSHeading>
        <XDSHeading level={3} display="inline">
          on the same line
        </XDSHeading>
      </div>
      <div>
        <XDSHeading level={3} display="block">
          Block H3 (default)
        </XDSHeading>
        <XDSHeading level={3} display="block">
          Each heading on its own line
        </XDSHeading>
      </div>
    </div>
  ),
};

// =============================================================================
// Truncation
// =============================================================================

export const SingleLineTruncation: Story = {
  render: () => (
    <div style={{width: '300px', border: '1px solid #ccc', padding: '12px'}}>
      <XDSHeading level={2} maxLines={1}>
        Very Long Heading That Will Be Truncated To One Line With Ellipsis
      </XDSHeading>
    </div>
  ),
};

export const MultiLineTruncation: Story = {
  render: () => (
    <div style={{width: '300px', border: '1px solid #ccc', padding: '12px'}}>
      <XDSHeading level={2} maxLines={2}>
        Very Long Heading That Will Be Truncated To Two Lines To Keep Card
        Layout Compact
      </XDSHeading>
    </div>
  ),
};

// =============================================================================
// Accessibility Level Override
// =============================================================================

export const AccessibilityLevel: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div>
        <XDSText type="supporting" display="block">
          Normal heading: visual and semantic levels match
        </XDSText>
        <XDSHeading level={2}>Section Title (h2, aria-level=2)</XDSHeading>
      </div>
      <div style={{marginTop: '16px'}}>
        <XDSText type="supporting" display="block">
          Sidebar heading: visual h2 but semantic h3 (doesn't affect main
          outline)
        </XDSText>
        <XDSHeading level={2} accessibilityLevel={3}>
          Sidebar Section (looks like h2, aria-level=3)
        </XDSHeading>
      </div>
    </div>
  ),
};

// =============================================================================
// Decorations
// =============================================================================

export const Strikethrough: Story = {
  args: {
    level: 2,
    hasStrikethrough: true,
    children: 'Deprecated Section',
  },
};

export const Capsize: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div>
        <XDSText type="label" display="block">
          Without capsize (red border shows extra space):
        </XDSText>
        <div style={{border: '1px solid red', display: 'inline-block'}}>
          <XDSHeading level={1}>Regular Heading</XDSHeading>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          With capsize (optically aligned):
        </XDSText>
        <div style={{border: '1px solid red', display: 'inline-block'}}>
          <XDSHeading level={1} hasCapsize>
            Capsize Heading
          </XDSHeading>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Real-World Examples
// =============================================================================

export const PageLayout: Story = {
  render: () => (
    <div style={{maxWidth: '800px'}}>
      <XDSHeading level={1}>Dashboard Overview</XDSHeading>
      <XDSText type="supporting" display="block">
        Last updated 5 minutes ago
      </XDSText>

      <div style={{marginTop: '32px'}}>
        <XDSHeading level={2}>Recent Activity</XDSHeading>
        <XDSText type="body" display="block">
          Here's what's been happening in your workspace.
        </XDSText>
      </div>

      <div style={{marginTop: '24px'}}>
        <XDSHeading level={3}>Today</XDSHeading>
        <XDSText type="body" display="block">
          • Project Alpha updated
          <br />
          • 3 new comments
          <br />• Task completed
        </XDSText>
      </div>
    </div>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        maxWidth: '800px',
      }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
          <XDSHeading level={3} maxLines={1}>
            {i === 1 && 'Very Long Card Title That Gets Truncated'}
            {i === 2 && 'Another Card'}
            {i === 3 &&
              'Third Card With An Even Longer Title That Will Be Truncated'}
          </XDSHeading>
          <XDSText type="body" maxLines={2} display="block">
            This is a card description that might be quite long and needs to be
            truncated after two lines to keep the card compact and uniform.
          </XDSText>
          <XDSText type="supporting" display="block">
            Updated {i} hour{i > 1 ? 's' : ''} ago
          </XDSText>
        </div>
      ))}
    </div>
  ),
};
