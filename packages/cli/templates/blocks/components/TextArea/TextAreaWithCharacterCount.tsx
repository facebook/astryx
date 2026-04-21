'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaWithCharacterCount() {
  const [value, setValue] = useState('');
  return (
    <XDSTextArea
      label="Bio"
      value={value}
      onChange={setValue}
      placeholder="Tell us about yourself..."
      maxLength={150}
    />
  );
}
