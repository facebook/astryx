'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarWithVisibleValueLabel() {
  return <XDSProgressBar value={75} label="Storage used" hasValueLabel />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarWithVisibleValueLabel,
};
