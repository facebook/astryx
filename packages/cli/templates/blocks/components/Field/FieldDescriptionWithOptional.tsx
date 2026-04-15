'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldDescriptionWithOptional() {
  const bioId = useId();
  const bioDescId = useId();

  return (
    <XDSField
      label="Bio"
      description="Tell us about yourself"
      isOptional
      inputID={bioId}
      descriptionID={bioDescId}>
      <input id={bioId} aria-describedby={bioDescId} />
    </XDSField>
  );
}
