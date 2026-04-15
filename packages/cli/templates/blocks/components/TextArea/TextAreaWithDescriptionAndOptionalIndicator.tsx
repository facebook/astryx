'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';

export default function TextAreaWithDescriptionAndOptionalIndicator() {
  const [bio, setBio] = useState('');

  return (
    <XDSTextArea label="Bio" description="Tell us about yourself" isOptional value={bio} onChange={setBio} />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TextAreaWithDescriptionAndOptionalIndicator,
};
