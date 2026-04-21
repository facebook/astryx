'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarWithValueLabel() {
  return (
    <div style={{width: 300}}>
      <XDSProgressBar value={75} label="Storage used" hasValueLabel />
    </div>
  );
}
