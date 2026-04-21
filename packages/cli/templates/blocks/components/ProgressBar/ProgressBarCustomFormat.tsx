'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarCustomFormat() {
  return (
    <div style={{width: 300}}>
      <XDSProgressBar
        value={3.2}
        max={5}
        label="Disk usage"
        hasValueLabel
        formatValueLabel={(value: number, max: number) =>
          `${value} GB / ${max} GB`
        }
      />
      <div
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginTop: 4,
        }}>
        1.8 GB remaining
      </div>
    </div>
  );
}
