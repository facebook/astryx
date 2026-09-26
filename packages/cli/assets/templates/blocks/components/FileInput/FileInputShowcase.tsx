// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {FileInput} from '@astryxdesign/core/FileInput';

export default function FileInputShowcase() {
  const [value, setValue] = useState<File | File[] | null>(null);
  return (
    <div style={{width: 350}}>
      <FileInput
        label="Upload file"
        value={value}
        onChange={setValue}
        placeholder="Drag files here or click to browse"
      />
    </div>
  );
}
