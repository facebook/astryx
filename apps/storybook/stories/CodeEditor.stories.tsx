// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {CodeEditor} from '@xds/lab';

const meta: Meta<typeof CodeEditor> = {
  title: 'Lab/CodeEditor',
  component: CodeEditor,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: [
        'typescript',
        'javascript',
        'json',
        'html',
        'css',
        'python',
        'bash',
        'php',
        'hack',
        'yaml',
        'markdown',
        'plaintext',
      ],
    },
    size: {control: 'select', options: ['sm', 'md']},
    hasLineNumbers: {control: 'boolean'},
    isReadOnly: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof CodeEditor>;

const defaultCode = `function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;

function ControlledEditor(
  props: Partial<React.ComponentProps<typeof CodeEditor>>,
) {
  const [value, setValue] = useState(props.value ?? defaultCode);
  return (
    <CodeEditor
      language="typescript"
      hasLineNumbers
      {...props}
      value={value}
      onChange={setValue}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledEditor />,
};

export const JSONEditor: Story = {
  render: () => (
    <ControlledEditor
      value={`{\n  "name": "my-app",\n  "version": "1.0.0",\n  "settings": {\n    "port": 3000,\n    "debug": false\n  }\n}`}
      language="json"
      hasLineNumbers
    />
  ),
};

export const PythonEditor: Story = {
  render: () => (
    <ControlledEditor
      value={`def fibonacci(n: int) -> list[int]:\n    """Generate Fibonacci sequence."""\n    if n <= 0:\n        return []\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib[:n]\n\nresult = fibonacci(10)\nprint(result)`}
      language="python"
      hasLineNumbers
    />
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <ControlledEditor
      value=""
      placeholder="Type your code here..."
      language="typescript"
    />
  ),
};

export const ReadOnly: Story = {
  render: () => <ControlledEditor isReadOnly hasLineNumbers />,
};

export const WithMaxHeight: Story = {
  render: () => (
    <ControlledEditor
      value={Array.from(
        {length: 30},
        (_, i) => `const line${i + 1} = ${i + 1};`,
      ).join('\n')}
      language="typescript"
      hasLineNumbers
      maxHeight={200}
    />
  ),
};

export const SmallSize: Story = {
  render: () => <ControlledEditor size="sm" hasLineNumbers />,
};
