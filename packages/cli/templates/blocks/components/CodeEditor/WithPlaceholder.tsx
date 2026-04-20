'use client';

import {useState} from 'react';
import {XDSCodeEditor} from '@xds/lab';

export default function WithPlaceholder() {
  const [value, setValue] = useState('');
  return (
    <XDSCodeEditor
      language="typescript"
      placeholder="Type your code here..."
      value={value}
      onChange={setValue}
    />
  );
}
