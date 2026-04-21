'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarIndeterminate() {
  return (
    <div style={{width: 300}}>
      <XDSProgressBar isIndeterminate label="Loading..." />
    </div>
  );
}
