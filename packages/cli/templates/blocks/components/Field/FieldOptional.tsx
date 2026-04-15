'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldOptional() {
  const nicknameId = useId();

  return (
    <XDSField label="Nickname" isOptional inputID={nicknameId}>
      <input id={nicknameId} placeholder="Enter your nickname" />
    </XDSField>
  );
}
