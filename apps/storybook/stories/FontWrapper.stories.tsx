import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSFontWrapper, useXDSFontWrapperStyles} from '@xds/core';

const meta = {
  title: 'Typography/XDSFontWrapper',
  component: XDSFontWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'editorial'],
    },
  },
} satisfies Meta<typeof XDSFontWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * XDSFontWrapper applies base typography styles to native HTML elements.
 * Uses typography.css which references theme CSS custom properties.
 */
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <h1>Heading 1 (20px)</h1>
        <p>
          XDSFontWrapper automatically styles native HTML elements using the
          reset.css stylesheet. The styles use CSS custom properties from the
          theme, so they adapt automatically when you switch themes.
        </p>
        <h2>Heading 2 (18px)</h2>
        <p>
          This is body text at 14px. The default variant uses a dense heading
          scale optimized for internal tools and applications.
        </p>
      </>
    ),
  },
};

/**
 * Editorial variant uses larger heading sizes for content-heavy pages
 */
export const Editorial: Story = {
  args: {
    variant: 'editorial',
    children: (
      <>
        <h1>Article Title (32px)</h1>
        <p>
          The editorial variant uses a larger heading scale designed for
          documentation, blog posts, and other long-form content where
          readability is the primary concern.
        </p>
        <h2>Section Heading (24px)</h2>
        <p>
          Body text remains at 14px for consistency, but headings are
          significantly larger to create clear visual hierarchy.
        </p>
      </>
    ),
  },
};

/**
 * Demonstrates all prose elements with default styling
 */
export const AllElements: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>

        <p>
          This is a paragraph with <strong>strong text</strong> and{' '}
          <em>italic text</em>. You can also include <a href="#">links</a> and{' '}
          <code>inline code</code>.
        </p>

        <h3>Lists</h3>
        <ul>
          <li>Unordered list item 1</li>
          <li>Unordered list item 2</li>
          <li>Unordered list item 3</li>
        </ul>

        <ol>
          <li>Ordered list item 1</li>
          <li>Ordered list item 2</li>
          <li>Ordered list item 3</li>
        </ol>

        <h3>Blockquote</h3>
        <blockquote>
          Design systems are a set of interconnected patterns and shared
          practices coherently organized to achieve the purpose of digital
          products.
        </blockquote>

        <h3>Code Block</h3>
        <pre>
          <code>{`function greet(name: string) {
  return \`Hello, \${name}!\`;
}`}</code>
        </pre>

        <hr />

        <p>Content after a horizontal rule.</p>
      </>
    ),
  },
};

/**
 * Comparison of default vs editorial heading scales
 */
export const VariantComparison: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32}}>
      <div>
        <p style={{marginBottom: 16, fontWeight: 600}}>Default Variant</p>
        <XDSFontWrapper variant="default">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <p>Body text paragraph</p>
        </XDSFontWrapper>
      </div>
      <div>
        <p style={{marginBottom: 16, fontWeight: 600}}>Editorial Variant</p>
        <XDSFontWrapper variant="editorial">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <p>Body text paragraph</p>
        </XDSFontWrapper>
      </div>
    </div>
  ),
};

/**
 * Example markdown-like content (typical CMS output)
 */
export const MarkdownContent: Story = {
  args: {
    variant: 'editorial',
    children: (
      <>
        <h1>Getting Started with XDS</h1>
        <p>
          XDS is a design system for building internal tools and products. This
          guide will help you get up and running quickly.
        </p>

        <h2>Installation</h2>
        <p>Install the package using your preferred package manager:</p>
        <pre>
          <code>npm install @xds/core</code>
        </pre>

        <h2>Basic Usage</h2>
        <p>
          Import the components you need and wrap your app in the XDSTheme
          provider:
        </p>
        <pre>
          <code>{`import { XDSTheme, defaultTheme, XDSButton } from '@xds/core';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSButton label="Click me" onPress={() => alert('Hello!')} />
    </XDSTheme>
  );
}`}</code>
        </pre>

        <h2>Available Components</h2>
        <p>XDS provides the following component categories:</p>
        <ul>
          <li>
            <strong>Typography</strong> — XDSText, XDSHeading, XDSFontWrapper
          </li>
          <li>
            <strong>Inputs</strong> — XDSButton, XDSTextInput, XDSCheckboxInput
          </li>
          <li>
            <strong>Layout</strong> — XDSHStack, XDSVStack, XDSCard, XDSSection
          </li>
          <li>
            <strong>Feedback</strong> — XDSTooltip, XDSHoverCard
          </li>
        </ul>

        <h2>Theming</h2>
        <blockquote>
          Pro tip: The reset.css styles use CSS custom properties from the
          theme, so they automatically adapt when you switch themes.
        </blockquote>

        <hr />

        <h2>Next Steps</h2>
        <ol>
          <li>Explore the component documentation in Storybook</li>
          <li>Check out the example applications</li>
          <li>Join our Slack channel for support</li>
        </ol>
      </>
    ),
  },
};

/**
 * Alternative approach: Using StyleX styles programmatically via useFontWrapperStyles hook.
 * This is useful when you need more control over individual elements.
 */
function StyleXApproachDemo() {
  const {headingStyles, proseStyles} = useXDSFontWrapperStyles();

  return (
    <XDSFontWrapper>
      <p {...stylex.props(proseStyles?.p)}>
        While XDSFontWrapper automatically styles native elements via CSS, you
        can also use the{' '}
        <code {...stylex.props(proseStyles?.code)}>
          useXDSFontWrapperStyles
        </code>{' '}
        hook to access theme styles programmatically for StyleX-based styling:
      </p>

      <h2 {...stylex.props(headingStyles?.h2)}>Styled with StyleX</h2>
      <p {...stylex.props(proseStyles?.p)}>
        This approach gives you more control and type safety, but requires
        applying styles to each element individually.
      </p>

      <pre {...stylex.props(proseStyles?.pre)}>
        <code
          {...stylex.props(
            proseStyles?.preCode,
          )}>{`import { useFontWrapperStyles } from '@xds/core';
import * as stylex from '@stylexjs/stylex';

function Article() {
  const { headingStyles, proseStyles } = useXDSFontWrapperStyles();

  return (
    <article>
      <h1 {...stylex.props(headingStyles?.h1)}>Title</h1>
      <p {...stylex.props(proseStyles?.p)}>Content...</p>
    </article>
  );
}`}</code>
      </pre>
    </XDSFontWrapper>
  );
}

export const StyleXApproach: Story = {
  render: () => <StyleXApproachDemo />,
};
