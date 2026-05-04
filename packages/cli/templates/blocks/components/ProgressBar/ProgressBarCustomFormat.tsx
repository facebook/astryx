'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ProgressBarCustomFormat() {
  return (
    <div style={{width: 300}}>
      <XDSVStack gap={1}>
        <XDSProgressBar
          value={3.2}
          max={5}
          label="Disk usage"
          hasValueLabel
          formatValueLabel={(value: number, max: number) =>
            `${value} GB / ${max} GB`
          }
        />
        <XDSText type="supporting" color="secondary">
          1.8 GB remaining
        </XDSText>
      </XDSVStack>
    </div>
  );
}
