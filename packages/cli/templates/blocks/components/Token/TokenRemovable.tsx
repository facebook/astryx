'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenRemovable() {
  return (
    <XDSToken label="Filter" onRemove={(e) => handleRemove(e)} />
  );
}
