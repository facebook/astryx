'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

const updateSetting = async (_key: string, _v: boolean) => {};

export default function SwitchWithAsyncActionAndOptimisticUI() {
  const [syncEnabled, setSyncEnabled] = useState(false);

  return (
    <XDSSwitch
      label="Sync to cloud"
      value={syncEnabled}
      onChange={setSyncEnabled}
      onChangeAction={async (checked) => {
        await updateSetting('sync', checked);
      }}
    />
  );
}
