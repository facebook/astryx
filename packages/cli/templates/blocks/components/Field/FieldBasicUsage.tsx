'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldBasicUsage() {
  const id = useId();

  return (
    <XDSField label="Email" inputID={id}>
      <input id={id} />
    </XDSField>
  );
}
