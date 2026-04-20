'use client';

import {useState} from 'react';
import {XDSCodeEditor} from '@xds/lab';

const code = `function greet(name: string): string {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;

export default function ReadOnlyEditor() {
  const [value, setValue] = useState(code);
  return (
    <XDSCodeEditor
      language="typescript"
      hasLineNumbers
      isReadOnly
      value={value}
      onChange={setValue}
    />
  );
}
