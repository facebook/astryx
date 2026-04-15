'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputOptionalField() {
  const [ext, setExt] = useState<number | null>(null);

  return (
    <XDSNumberInput
      label="Phone Extension"
      isOptional
      value={ext}
      onChange={setExt}
    />
  );
}
