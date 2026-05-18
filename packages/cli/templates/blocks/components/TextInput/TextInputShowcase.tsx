// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputShowcase() {
  return (
    <div style={{width: 300}}>
      <XDSTextInput
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter your name"
      />
    </div>
  );
}
