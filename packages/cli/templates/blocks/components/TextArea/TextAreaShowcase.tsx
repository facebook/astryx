'use client';

import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaShowcase() {
  return (
    <div style={{width: 400}}>
      <XDSTextArea
        label="Description"
        value=""
        onChange={() => {}}
        placeholder="Enter a description..."
      />
    </div>
  );
}
