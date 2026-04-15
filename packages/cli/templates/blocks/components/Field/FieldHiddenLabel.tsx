'use client';

import {useId} from 'react';
import {XDSField} from '@xds/core/Field';

export default function FieldHiddenLabel() {
  const searchId = useId();

  return (
    <XDSField label="Search" isLabelHidden inputID={searchId}>
      <input id={searchId} placeholder="Search..." />
    </XDSField>
  );
}
