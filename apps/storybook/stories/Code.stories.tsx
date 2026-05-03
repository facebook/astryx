import type {Meta, StoryObj} from '@storybook/react';
import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';
import {XDSLink} from '@xds/core/Link';

const meta: Meta<typeof XDSCode> = {
  title: 'Core/Code',
  component: XDSCode,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Code content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCode>;

export const Default: Story = {
  args: {
    children: 'const x = 1',
  },
};

export const InParagraph: Story = {
  name: 'Inline in paragraph',
  render: () => (
    <XDSText type="body">
      Use <XDSCode>useState</XDSCode> for local state and{' '}
      <XDSCode>useEffect</XDSCode> for side effects. If you need shared state
      across components, consider <XDSCode>useContext</XDSCode> or a state
      management library.
    </XDSText>
  ),
};

export const InstructionalParagraph: Story = {
  name: 'Instructional text',
  render: () => (
    <XDSStack gap="md">
      <XDSText type="body">
        Install the package with <XDSCode>npm install @xds/core</XDSCode>, then
        import the component:
      </XDSText>
      <XDSText type="body">
        Add <XDSCode>{'<XDSButton label="Save">Save</XDSButton>'}</XDSCode> to
        your JSX. The <XDSCode>label</XDSCode> prop is required for
        accessibility.
      </XDSText>
    </XDSStack>
  ),
};

export const MixedInline: Story = {
  name: 'Mixed with links and emphasis',
  render: () => (
    <XDSText type="body">
      The <XDSCode>XDSThemeProvider</XDSCode> component wraps your app and
      supplies design tokens. See the{' '}
      <XDSLink href="/docs/theme" isExternalLink={false}>
        theme docs
      </XDSLink>{' '}
      for setup. Set <XDSCode>colorScheme=&quot;dark&quot;</XDSCode> to enable
      dark mode.
    </XDSText>
  ),
};

export const VariousContent: Story = {
  name: 'Various code content',
  render: () => (
    <XDSStack gap="sm">
      <XDSText type="body">
        Variable: <XDSCode>const count = 0</XDSCode>
      </XDSText>
      <XDSText type="body">
        Terminal: <XDSCode>yarn build --watch</XDSCode>
      </XDSText>
      <XDSText type="body">
        CSS property: <XDSCode>border-radius: 8px</XDSCode>
      </XDSText>
      <XDSText type="body">
        File path: <XDSCode>packages/core/src/CodeBlock/XDSCode.tsx</XDSCode>
      </XDSText>
      <XDSText type="body">
        Keyboard shortcut: <XDSCode>Ctrl+Shift+P</XDSCode>
      </XDSText>
    </XDSStack>
  ),
};

export const TextSizes: Story = {
  name: 'Across text sizes',
  render: () => (
    <XDSStack gap="sm">
      <XDSText type="heading3">
        Heading with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="body">
        Body text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="detail">
        Detail text with <XDSCode>inline code</XDSCode>
      </XDSText>
      <XDSText type="label">
        Label text with <XDSCode>inline code</XDSCode>
      </XDSText>
    </XDSStack>
  ),
};
