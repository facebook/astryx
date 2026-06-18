// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxInput} from '@xds/core/CheckboxInput';
import {Stack} from '@xds/core/Layout';

export default function CheckboxInputBasic() {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(true);
  const [unchecked, setUnchecked] = useState<boolean | 'indeterminate'>(false);
  const [disabled, setDisabled] = useState<boolean | 'indeterminate'>(false);
  const [indeterminate, setIndeterminate] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );

  return (
    <Stack direction="vertical" gap={4}>
      <CheckboxInput
        label="Checked"
        description="This checkbox is currently on."
        value={checked}
        onChange={setChecked}
      />
      <CheckboxInput
        label="Unchecked"
        description="This checkbox is currently off."
        value={unchecked}
        onChange={setUnchecked}
      />
      <CheckboxInput
        label="Disabled"
        description="This checkbox cannot be changed."
        value={disabled}
        onChange={setDisabled}
        isDisabled
      />
      <CheckboxInput
        label="Indeterminate"
        description="This checkbox represents a partial selection."
        value={indeterminate}
        onChange={setIndeterminate}
      />
    </Stack>
  );
}
