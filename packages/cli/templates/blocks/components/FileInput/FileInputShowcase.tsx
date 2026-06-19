// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {FileInput} from '@xds/core/FileInput';

export default function FileInputShowcase() {
  return (
    <div style={{width: 350}}>
      <FileInput
        label="Upload file"
        value={null}
        onChange={() => {}}
        placeholder="Drag files here or click to browse"
      />
    </div>
  );
}
