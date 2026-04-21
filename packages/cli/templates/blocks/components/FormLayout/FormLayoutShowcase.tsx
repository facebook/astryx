'use client';

import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FormLayoutShowcase() {
  return (
    <XDSFormLayout>
      <XDSTextInput label="Name" value="" onChange={() => {}} />
      <XDSTextInput label="Email" value="" onChange={() => {}} />
      <XDSTextInput label="Bio" value="" onChange={() => {}} />
    </XDSFormLayout>
  );
}
