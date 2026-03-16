import type {Meta, StoryObj} from '@storybook/react';
import {XDSFontWrapper} from '@xds/core/Text';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSFontWrapper> = {
  title: 'Typography/XDSFontWrapper',
  component: XDSFontWrapper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof XDSFontWrapper>;

// =============================================================================
// Basic Usage
// =============================================================================

export const Default: Story = {
  render: () => (
    <XDSFontWrapper>
      <h1>Heading 1 (24px)</h1>
      <h2>Heading 2 (20px)</h2>
      <h3>Heading 3 (17px)</h3>
      <h4>Heading 4 (14px — base)</h4>
      <h5>Heading 5 (12px)</h5>
      <h6>Heading 6 (10px)</h6>
      <p>
        Body text with <strong>bold</strong> and <em>italic</em> styles.
        Typography sizing is controlled by the theme's type scale tokens.
      </p>
    </XDSFontWrapper>
  ),
};

// =============================================================================
// Prose Content
// =============================================================================

export const ProseContent: Story = {
  render: () => (
    <div style={{maxWidth: '600px'}}>
      <XDSFontWrapper>
        <h1>The Art of Typography</h1>
        <p>
          Good typography is invisible. It creates a seamless reading experience
          that guides users through content without friction. The type scale
          establishes visual hierarchy — each heading level has a deliberate
          size relationship to the next.
        </p>
        <h2>Hierarchy Through Scale</h2>
        <p>
          XDS uses a ratio-based type scale (base=14px, ratio=1.2) where each
          step is a geometric progression from the base size. This creates
          natural visual harmony between heading levels.
        </p>
        <blockquote>
          <p>
            "The details are not the details. They make the design." — Charles
            Eames
          </p>
        </blockquote>
        <h3>Lists and Structure</h3>
        <p>Key principles:</p>
        <ul>
          <li>h4 anchors to the base font size (14px)</li>
          <li>Headings above h4 scale up by the ratio</li>
          <li>Headings below h4 scale down by the ratio</li>
          <li>Line heights snap to a 4px grid</li>
        </ul>
        <h3>Code Examples</h3>
        <p>
          Inline <code>code</code> uses a monospace font at 0.9em. Block code
          uses the supporting text size:
        </p>
        <pre>
          <code>
            {`const theme = defineTheme({
  name: 'custom',
  typeScale: { base: 16, ratio: 1.25 },
});`}
          </code>
        </pre>
        <hr />
        <p>
          For different density regions, nest <code>&lt;XDSTheme&gt;</code> with
          a different <code>typeScale</code> configuration.
        </p>
      </XDSFontWrapper>
    </div>
  ),
};

// =============================================================================
// Markdown Rendering
// =============================================================================

export const MarkdownRendering: Story = {
  render: () => (
    <div style={{maxWidth: '600px'}}>
      <XDSText type="supporting" display="block" color="secondary">
        XDSFontWrapper is ideal for rendering markdown or CMS content where you
        don't control the HTML structure.
      </XDSText>
      <div style={{marginTop: '16px'}}>
        <XDSFontWrapper>
          <h2>Getting Started</h2>
          <p>Follow these steps to set up your project:</p>
          <ol>
            <li>Install the dependencies</li>
            <li>Configure the theme</li>
            <li>Wrap your app in XDSTheme</li>
          </ol>
          <h3>Installation</h3>
          <pre>
            <code>npm install @xds/core @xds/theme-default</code>
          </pre>
          <h3>Configuration</h3>
          <p>
            Import the theme and wrap your app. Typography will automatically
            use the theme's type scale tokens for consistent sizing.
          </p>
          <p>
            <a href="#">Read the full documentation →</a>
          </p>
        </XDSFontWrapper>
      </div>
    </div>
  ),
};
