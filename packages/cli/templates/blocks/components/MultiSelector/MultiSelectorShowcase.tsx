// Copyright (c) Meta Platforms, Inc. and affiliates.

import {MultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorShowcase() {
  return (
    <div style={{width: 300}}>
      <MultiSelector
        label="Columns"
        options={['Name', 'Email', 'Role', 'Status', 'Created']}
        value={[]}
        onChange={() => {}}
        placeholder="Select columns..."
      />
    </div>
  );
}
