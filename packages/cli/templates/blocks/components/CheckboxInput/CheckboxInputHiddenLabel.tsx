'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputHiddenLabel() {
  const [selected, setSelected] = useState(false);
  return (
    <XDSCheckboxInput
      label="Select row"
      isLabelHidden
      value={selected}
      onChange={setSelected}
    />
  );
}
