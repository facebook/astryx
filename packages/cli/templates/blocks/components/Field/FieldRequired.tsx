'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldRequired() {
  const usernameId = useId();

  return (
    <XDSField label="Username" isRequired inputID={usernameId}>
      <input id={usernameId} placeholder="Enter your username" />
    </XDSField>
  );
}
