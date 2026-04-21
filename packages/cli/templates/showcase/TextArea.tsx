'use client';

import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaShowcase() {
  return (
    <XDSTextArea
      label="Description"
      value=""
      onChange={() => {}}
      placeholder="Enter a description..."
    />
  );
}
