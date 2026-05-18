// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSFileInput} from '@xds/core/FileInput';

export default function FileInputShowcase() {
  return (
    <div style={{width: 350}}>
      <XDSFileInput
        label="Upload file"
        value={null}
        onChange={() => {}}
        placeholder="Drag files here or click to browse"
      />
    </div>
  );
}
