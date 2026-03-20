import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSCodeEditor} from '@xds/core/CodeEditor';

const meta: Meta<typeof XDSCodeEditor> = {
  title: 'Core/XDSCodeEditor',
  component: XDSCodeEditor,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'json', 'html', 'css', 'python', 'bash', 'plaintext'],
    },
    size: {control: 'select', options: ['sm', 'md']},
    showLineNumbers: {control: 'boolean'},
    readOnly: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSCodeEditor>;

const defaultCode = `function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;

function ControlledEditor(props: Partial<React.ComponentProps<typeof XDSCodeEditor>>) {
  const [value, setValue] = useState(props.value ?? defaultCode);
  return (
    <XDSCodeEditor
      language="typescript"
      showLineNumbers
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
      showLineNumbers
    />
  ),
};

export const PythonEditor: Story = {
  render: () => (
    <ControlledEditor
      value={`def fibonacci(n: int) -> list[int]:\n    """Generate Fibonacci sequence."""\n    if n <= 0:\n        return []\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib[:n]\n\nresult = fibonacci(10)\nprint(result)`}
      language="python"
      showLineNumbers
    />
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <ControlledEditor value="" placeholder="Type your code here..." language="typescript" />
  ),
};

export const ReadOnly: Story = {
  render: () => <ControlledEditor readOnly showLineNumbers />,
};

export const WithMaxHeight: Story = {
  render: () => (
    <ControlledEditor
      value={Array.from({length: 30}, (_, i) => `const line${i + 1} = ${i + 1};`).join('\n')}
      language="typescript"
      showLineNumbers
      maxHeight={200}
    />
  ),
};

export const SmallSize: Story = {
  render: () => <ControlledEditor size="sm" showLineNumbers />,
};
