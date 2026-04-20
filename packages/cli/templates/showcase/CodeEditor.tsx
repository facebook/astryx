import {XDSCodeEditor} from '@xds/lab';

const defaultCode = `function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;

export default function CodeEditorShowcase() {
  return (
    <XDSCodeEditor
      language="typescript"
      hasLineNumbers
      value={defaultCode}
      onChange={() => {}}
    />
  );
}
