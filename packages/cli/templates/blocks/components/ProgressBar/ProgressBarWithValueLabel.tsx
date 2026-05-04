'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';

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
