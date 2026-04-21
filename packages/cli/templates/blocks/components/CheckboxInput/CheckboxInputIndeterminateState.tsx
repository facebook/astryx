'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CheckboxInputIndeterminateState() {
  const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSCheckboxInput
        label="Select all notifications"
        description="2 of 4 notification types are enabled"
        value={selectAll}
        onChange={setSelectAll}
      />
      <XDSText type="supporting" color="secondary">
        The indeterminate state shows a dash instead of a checkmark, indicating
        partial selection. Clicking it toggles to fully checked or unchecked.
      </XDSText>
    </XDSStack>
  );
}
