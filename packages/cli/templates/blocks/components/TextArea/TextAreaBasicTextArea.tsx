'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaBasicTextArea() {
  const [value, setValue] = useState('');
  return (
    <XDSTextArea
      label="Bio"
      description="Tell us about yourself in a few sentences."
      value={value}
      onChange={setValue}
      placeholder="Write your bio here..."
    />
  );
}
