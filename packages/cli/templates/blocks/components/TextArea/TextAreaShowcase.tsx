// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {TextArea} from '@astryxdesign/core/TextArea';

export default function TextAreaShowcase() {
  return (
    <div style={{width: 400}}>
      <TextArea
        label="Description"
        value=""
        onChange={() => {}}
        placeholder="Enter a description..."
      />
    </div>
  );
}
