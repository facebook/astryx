// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputBasic() {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(true);
  const [unchecked, setUnchecked] = useState<boolean | 'indeterminate'>(false);
  const [disabled, setDisabled] = useState<boolean | 'indeterminate'>(false);
  const [indeterminate, setIndeterminate] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSCheckboxInput
        label="Checked"
        description="This checkbox is currently on."
        value={checked}
        onChange={setChecked}
      />
      <XDSCheckboxInput
        label="Unchecked"
        description="This checkbox is currently off."
        value={unchecked}
        onChange={setUnchecked}
      />
      <XDSCheckboxInput
        label="Disabled"
        description="This checkbox cannot be changed."
        value={disabled}
        onChange={setDisabled}
        isDisabled
      />
      <XDSCheckboxInput
        label="Indeterminate"
        description="This checkbox represents a partial selection."
        value={indeterminate}
        onChange={setIndeterminate}
      />
    </XDSStack>
  );
}
