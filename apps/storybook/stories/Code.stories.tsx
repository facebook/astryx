// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Code} from '@astryxdesign/core/CodeBlock';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';
import {Link} from '@astryxdesign/core/Link';

const meta: Meta<typeof Code> = {
  title: 'Core/Code',
  component: Code,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Code content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {
  args: {
    children: 'const x = 1',
  },
};

export const InParagraph: Story = {
  name: 'Inline in paragraph',
  render: () => (
    <Text type="body">
      Use <Code>useState</Code> for local state and{' '}
      <Code>useEffect</Code> for side effects. If you need shared state
      across components, consider <Code>useContext</Code> or a state
      management library.
    </Text>
  ),
};

export const InstructionalParagraph: Story = {
  name: 'Instructional text',
  render: () => (
    <Stack gap={3}>
      <Text type="body">
        Install the package with <Code>npm install @astryxdesign/core</Code>, then
        import the component:
      </Text>
      <Text type="body">
        Add <Code>{'<Button label="Save">Save</Button>'}</Code> to
        your JSX. The <Code>label</Code> prop is required for
        accessibility.
      </Text>
    </Stack>
  ),
};

export const MixedInline: Story = {
  name: 'Mixed with links and emphasis',
  render: () => (
    <Text type="body">
      The <Code>ThemeProvider</Code> component wraps your app and
      supplies design tokens. See the{' '}
      <Link href="/docs/theme" isExternalLink={false}>
        theme docs
      </Link>{' '}
      for setup. Set <Code>colorScheme=&quot;dark&quot;</Code> to enable
      dark mode.
    </Text>
  ),
};

export const VariousContent: Story = {
  name: 'Various code content',
  render: () => (
    <Stack gap={2}>
      <Text type="body">
        Variable: <Code>const count = 0</Code>
      </Text>
      <Text type="body">
        Terminal: <Code>pnpm build --watch</Code>
      </Text>
      <Text type="body">
        CSS property: <Code>border-radius: 8px</Code>
      </Text>
      <Text type="body">
        File path: <Code>packages/core/src/CodeBlock/Code.tsx</Code>
      </Text>
      <Text type="body">
        Keyboard shortcut: <Code>Ctrl+Shift+P</Code>
      </Text>
    </Stack>
  ),
};

export const TextSizes: Story = {
  name: 'Across text sizes',
  render: () => (
    <Stack gap={2}>
      <Text type="large">
        Heading with <Code>inline code</Code>
      </Text>
      <Text type="body">
        Body text with <Code>inline code</Code>
      </Text>
      <Text type="supporting">
        Detail text with <Code>inline code</Code>
      </Text>
      <Text type="label">
        Label text with <Code>inline code</Code>
      </Text>
    </Stack>
  ),
};
