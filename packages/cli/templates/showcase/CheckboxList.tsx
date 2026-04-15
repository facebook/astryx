'use client';

import {XDSCheckboxList} from '@xds/core/CheckboxList';

export default function CheckboxListShowcase() {
  return (
    <XDSCheckboxList
      label="Options"
      items={[{label: 'Option A', value: 'a'}]}
    />
  );
}
