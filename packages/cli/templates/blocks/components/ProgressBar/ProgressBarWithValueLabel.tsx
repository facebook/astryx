'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarWithValueLabel() {
  return (
    <XDSProgressBar
      value={75}
      label="Storage used"
      hasValueLabel
      style={{width: 300}}
    />
  );
}
