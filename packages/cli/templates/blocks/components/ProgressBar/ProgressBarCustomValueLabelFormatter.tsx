'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarCustomValueLabelFormatter() {
  return (
    <XDSProgressBar
      value={3.2}
      max={5}
      label="Disk usage"
      hasValueLabel
      formatValueLabel={(value, max) => `${value} GB / ${max} GB`}
    />
  );
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarCustomValueLabelFormatter,
};
