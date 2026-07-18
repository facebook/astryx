// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {FileInput} from '@astryxdesign/core/FileInput';

export default function FileInputBasic() {
  const [value, setValue] = useState<File | File[] | null>(null);
  return (
    <div style={{width: 350}}>
      <FileInput
        label="Resume"
        value={value}
        onChange={setValue}
        accept=".pdf,.docx"
        description="PDF or Word document, up to 5 MB"
        maxSize={5 * 1024 * 1024}
      />
    </div>
  );
}
