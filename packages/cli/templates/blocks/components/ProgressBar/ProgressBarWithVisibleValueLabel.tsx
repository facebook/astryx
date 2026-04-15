'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarWithVisibleValueLabel() {
  return <XDSProgressBar value={75} label="Storage used" hasValueLabel />;
}
