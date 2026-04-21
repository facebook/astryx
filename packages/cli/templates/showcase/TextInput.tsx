'use client';

import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputShowcase() {
  return (
    <XDSTextInput
      label="Name"
      value=""
      onChange={() => {}}
      placeholder="Enter your name"
    />
  );
}
