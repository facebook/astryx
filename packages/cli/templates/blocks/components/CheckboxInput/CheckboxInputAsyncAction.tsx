'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputAsyncAction() {
  const [enabled, setEnabled] = useState(false);
  return (
    <XDSCheckboxInput
      label="Enable feature"
      value={enabled}
      onChange={setEnabled}
      onChangeAction={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}
