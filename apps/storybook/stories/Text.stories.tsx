import type {Meta, StoryObj} from '@storybook/react';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSText> = {
  title: 'Typography/XDSText',
  component: XDSText,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['body', 'large', 'label', 'supporting', 'code'],
      description: 'Semantic text type',
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
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight override',
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
    hasTabularNumbers: {
      control: 'boolean',
      description: 'Use tabular (monospace) numbers',
    },
    hasCapsize: {
      control: 'boolean',
      description: 'Enable optical alignment (text-box-trim)',
    },
    as: {
      control: 'select',
      options: ['span', 'p', 'div', 'label'],
      description: 'HTML element to render',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSText>;

// =============================================================================
// Basic Types
// =============================================================================

export const Body: Story = {
  args: {
    type: 'body',
    children: 'Body text - the bulk of content (14px)',
  },
};

export const Large: Story = {
  args: {
    type: 'large',
    children: 'Large text - emphasized content, quotes, descriptions (16px)',
  },
};

export const Label: Story = {
  args: {
    type: 'label',
    children: 'Label text - form/chart/table labels (14px medium)',
  },
};

export const Supporting: Story = {
  args: {
    type: 'supporting',
    children:
      'Supporting text - helper text, supplemental info (12px, secondary color)',
  },
};

export const Code: Story = {
  args: {
    type: 'code',
    children: 'const x = 1; // Inline code (14px monospace)',
  },
};

// =============================================================================
// All Types Overview
// =============================================================================

export const AllTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSText type="body">Body: The bulk of content (14px)</XDSText>
      <XDSText type="large">Large: Emphasized content (16px)</XDSText>
      <XDSText type="label">Label: Form/chart labels (14px medium)</XDSText>
      <XDSText type="supporting">
        Supporting: Helper text (12px secondary)
      </XDSText>
      <XDSText type="code">Code: const x = 1; (14px monospace)</XDSText>
    </div>
  ),
};

// =============================================================================
// Color Variants
// =============================================================================

export const ColorVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <XDSText type="body" color="primary">
        Primary color (default for body)
      </XDSText>
      <XDSText type="body" color="secondary">
        Secondary color
      </XDSText>
      <XDSText type="body" color="disabled">
        Disabled color
      </XDSText>
      <XDSText type="body" color="placeholder">
        Placeholder color
      </XDSText>
      <XDSText type="body" color="active">
        Active color (accent)
      </XDSText>
      <div style={{color: 'purple'}}>
        <XDSText type="body" color="inherit">
          Inherit color (from parent)
        </XDSText>
      </div>
    </div>
  ),
};

// =============================================================================
// Weight Variants
// =============================================================================

export const WeightVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <XDSText type="body" weight="normal">
        Normal weight (400)
      </XDSText>
      <XDSText type="body" weight="medium">
        Medium weight (500)
      </XDSText>
      <XDSText type="body" weight="semibold">
        Semibold weight (600)
      </XDSText>
      <XDSText type="body" weight="bold">
        Bold weight (700)
      </XDSText>
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
        <XDSText type="body" display="inline">
          Inline text{' '}
        </XDSText>
        <XDSText type="body" display="inline">
          flows together{' '}
        </XDSText>
        <XDSText type="body" display="inline">
          on the same line.
        </XDSText>
      </div>
      <div>
        <XDSText type="body" display="block">
          Block text takes its own line.
        </XDSText>
        <XDSText type="body" display="block">
          Each block is on a separate line.
        </XDSText>
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
      <XDSText type="body" maxLines={1}>
        This is a very long text that will be truncated to a single line. Hover
        over it to see the full content in a tooltip.
      </XDSText>
    </div>
  ),
};

export const MultiLineTruncation: Story = {
  render: () => (
    <div style={{width: '300px', border: '1px solid #ccc', padding: '12px'}}>
      <XDSText type="body" maxLines={2}>
        This is a very long text that will be truncated to exactly two lines.
        When you hover over it, a tooltip will appear showing the full text
        content. This is useful for displaying preview text in cards and lists.
      </XDSText>
    </div>
  ),
};

export const TruncationWithoutTooltip: Story = {
  render: () => (
    <div style={{width: '300px', border: '1px solid #ccc', padding: '12px'}}>
      <XDSText type="body" maxLines={1} hasTruncateTooltip={false}>
        This text is truncated but has no tooltip on hover. Sometimes you don't
        want a tooltip.
      </XDSText>
    </div>
  ),
};

export const TruncationVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '300px',
      }}>
      <div>
        <XDSText type="label" display="block">
          1 Line:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px'}}>
          <XDSText type="body" maxLines={1}>
            This is a very long text that will be truncated to one line with
            ellipsis.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          2 Lines:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px'}}>
          <XDSText type="body" maxLines={2}>
            This is a very long text that will be truncated to two lines. The
            second line will end with an ellipsis if the content is too long.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          3 Lines:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px'}}>
          <XDSText type="body" maxLines={3}>
            This is a very long text that will be truncated to three lines. It
            allows for more content to be shown but still limits the vertical
            space. The third line will end with an ellipsis.
          </XDSText>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Word Break
// =============================================================================

export const WordBreakVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', maxWidth: '600px'}}>
      <div style={{flex: 1}}>
        <XDSText type="label" display="block">
          break-word (default for multi-line):
        </XDSText>
        <div style={{width: '150px', border: '1px solid #ccc', padding: '8px'}}>
          <XDSText type="body" maxLines={2} wordBreak="break-word">
            Thisisaverylongwordthatneedstobreakatwordlevel
          </XDSText>
        </div>
      </div>
      <div style={{flex: 1}}>
        <XDSText type="label" display="block">
          break-all (default for single-line):
        </XDSText>
        <div style={{width: '150px', border: '1px solid #ccc', padding: '8px'}}>
          <XDSText type="body" maxLines={2} wordBreak="break-all">
            Thisisaverylongwordthatneedstobreakatanylevel
          </XDSText>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Text Wrap
// =============================================================================

export const TextWrapVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '400px',
      }}>
      <div>
        <XDSText type="label" display="block">
          wrap (default):
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px', width: '200px'}}>
          <XDSText type="body" textWrap="wrap">
            This text wraps normally at word boundaries when it reaches the
            edge.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          nowrap:
        </XDSText>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '8px',
            width: '200px',
            overflow: 'hidden',
          }}>
          <XDSText type="body" textWrap="nowrap">
            This text does not wrap and will overflow its container.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          balance:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px', width: '200px'}}>
          <XDSText type="body" textWrap="balance">
            This text is balanced for better visual appearance across lines.
          </XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          pretty:
        </XDSText>
        <div style={{border: '1px solid #ccc', padding: '8px', width: '200px'}}>
          <XDSText type="body" textWrap="pretty">
            This text uses pretty wrap to avoid orphans at the end of
            paragraphs.
          </XDSText>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Decorations
// =============================================================================

export const Strikethrough: Story = {
  args: {
    type: 'body',
    hasStrikethrough: true,
    children: 'This text has a strikethrough decoration',
  },
};

export const TabularNumbers: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div>
        <XDSText type="label" display="block">
          Without tabular numbers:
        </XDSText>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <XDSText type="body">1,234.56</XDSText>
          <XDSText type="body">99,999.99</XDSText>
          <XDSText type="body">111.11</XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          With tabular numbers:
        </XDSText>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <XDSText type="body" hasTabularNumbers>
            1,234.56
          </XDSText>
          <XDSText type="body" hasTabularNumbers>
            99,999.99
          </XDSText>
          <XDSText type="body" hasTabularNumbers>
            111.11
          </XDSText>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Capsize (Optical Alignment)
// =============================================================================

export const Capsize: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div>
        <XDSText type="label" display="block">
          Without capsize (red border shows extra space):
        </XDSText>
        <div style={{border: '1px solid red', display: 'inline-block'}}>
          <XDSText type="large">Regular text with line-height space</XDSText>
        </div>
      </div>
      <div>
        <XDSText type="label" display="block">
          With capsize (optically aligned):
        </XDSText>
        <div style={{border: '1px solid red', display: 'inline-block'}}>
          <XDSText type="large" hasCapsize>
            Capsize removes extra space
          </XDSText>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// As Different Elements
// =============================================================================

export const AsElements: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <XDSText type="body" as="span">
        As span (default, inline)
      </XDSText>
      <XDSText type="body" as="p">
        As paragraph element
      </XDSText>
      <XDSText type="body" as="div">
        As div element
      </XDSText>
      <XDSText type="body" as="label">
        As label element
      </XDSText>
    </div>
  ),
};

// =============================================================================
// Real-World Examples
// =============================================================================

export const CardExample: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '300px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
      <XDSText type="label" display="block">
        Product Name
      </XDSText>
      <XDSText type="body" maxLines={2} display="block">
        This is a product description that might be quite long and needs to be
        truncated after two lines to keep the card compact.
      </XDSText>
      <XDSText type="supporting" display="block">
        Updated 5 minutes ago
      </XDSText>
    </div>
  ),
};

export const MetricsExample: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px'}}>
      <div style={{textAlign: 'center'}}>
        <XDSText type="body" color="secondary" display="block">
          Revenue
        </XDSText>
        <XDSText type="large" weight="bold" hasTabularNumbers>
          $1,234,567.89
        </XDSText>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSText type="body" color="secondary" display="block">
          Users
        </XDSText>
        <XDSText type="large" weight="bold" hasTabularNumbers>
          12,345
        </XDSText>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSText type="body" color="secondary" display="block">
          Conversion
        </XDSText>
        <XDSText type="large" weight="bold" color="active" hasTabularNumbers>
          23.4%
        </XDSText>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
      <div>
        <XDSText type="label" as="label" display="block">
          Email address
        </XDSText>
        <input
          type="email"
          style={{width: '100%', padding: '8px', marginTop: '4px'}}
        />
        <XDSText type="supporting" display="block">
          We'll never share your email.
        </XDSText>
      </div>
      <div>
        <XDSText type="label" as="label" display="block">
          Password
        </XDSText>
        <input
          type="password"
          style={{width: '100%', padding: '8px', marginTop: '4px'}}
        />
        <XDSText type="supporting" color="active" display="block">
          Must be at least 8 characters.
        </XDSText>
      </div>
    </div>
  ),
};
