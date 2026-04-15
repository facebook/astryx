'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputDisabled() {
  return (
    <XDSCheckboxInput
      label="Premium feature"
      description="Upgrade to enable this option"
      value={false}
      onChange={() => {}}
      isDisabled
    />
  );
}
