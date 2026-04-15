'use client';

import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaDisabled() {
  return (
    <XDSTextArea label="Read-only notes" isDisabled value="Cannot edit this" onChange={() => {}} />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TextAreaDisabled,
};
