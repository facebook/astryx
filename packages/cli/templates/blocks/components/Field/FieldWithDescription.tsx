'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldWithDescription() {
  const inputId = useId();
  const descId = useId();

  return (
    <XDSField
      label="Email"
      description="We'll never share your email"
      inputID={inputId}
      descriptionID={descId}>
      <input id={inputId} aria-describedby={descId} />
    </XDSField>
  );
}
