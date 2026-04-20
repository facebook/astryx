'use client';

import {useState} from 'react';
import {XDSCodeEditor} from '@xds/lab';

const defaultJSON = `{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "port": 3000,
    "debug": false
  }
}`;

export default function CodeEditorJSONEditor() {
  const [value, setValue] = useState(defaultJSON);
  return (
    <XDSCodeEditor
      language="json"
      hasLineNumbers
      value={value}
      onChange={setValue}
    />
  );
}
