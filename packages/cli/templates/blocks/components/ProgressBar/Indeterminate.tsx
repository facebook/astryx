'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function Indeterminate() {
  return (
    <div style={{width: 300}}>
      <XDSProgressBar isIndeterminate label="Loading..." />
    </div>
  );
}
